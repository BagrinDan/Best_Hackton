import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from fastapi.testclient import TestClient

from app.controllers.card_controller import CARDS_DIR
from app.core.parsing_book import ParsingBook
from app.main import app


class CardControllerTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        self.directory = tempfile.TemporaryDirectory(dir=CARDS_DIR)
        self.addCleanup(self.directory.cleanup)
        self.root = Path(self.directory.name)
        self.batch_id = self.root.name
        self.addCleanup(patch.stopall)
        patch("app.controllers.card_controller.uuid4").start().return_value.hex = self.batch_id
        plan = {"layout": "simplu", "subtipo": "", "formula": "", "elemente": [],
                "operatori": [], "explicatie_vizuala": "Explanation"}
        patch.object(ParsingBook, "_ask", return_value=plan).start()

    def test_definition_endpoint_generates_retrievable_svg_and_preview(self):
        response = self.client.post("/api/cards/generate", json={"definitions": [
            {"term": "Forța", "definition": "A source definition", "quote": "source", "page": 12}
        ]})
        self.assertEqual(response.status_code, 200, response.text)
        data = response.json()
        self.assertEqual(data["count"], 1)
        self.assertEqual(data["cards"][0]["page"], 12)
        svg_response = self.client.get(data["cards"][0]["svg_url"])
        self.assertEqual(svg_response.status_code, 200)
        self.assertIn("image/svg+xml", svg_response.headers["content-type"])
        self.assertEqual(self.client.get(data["preview_url"]).status_code, 200)
        self.assertIn(f"/cards/{self.batch_id}/", data["cards"][0]["svg_url"])

    def test_invalid_definitions_and_pdf_are_rejected(self):
        self.assertEqual(self.client.post("/api/cards/generate", json={"definitions": []}).status_code, 422)
        self.assertEqual(self.client.post("/api/cards/generate", json={"definitions": [
            {"term": " ", "definition": "text"}
        ]}).status_code, 422)
        self.assertEqual(self.client.post("/api/cards/generate-from-pdf", files={
            "file": ("book.pdf", b"not a PDF", "application/pdf")
        }).status_code, 400)

    def test_pdf_is_passed_to_parser_and_temporary_upload_is_removed(self):
        seen = []
        def extract(parser, limit_chunks=None):
            seen.append(parser.pdf_path)
            self.assertTrue(parser.pdf_path.exists())
            self.assertEqual(parser.skip_pages, 5)
            self.assertEqual(limit_chunks, 2)
            return [{"term": "Term", "definition": "Text", "quote": "source", "page": 6}]
        with patch.object(ParsingBook, "parsing_book", new=extract):
            response = self.client.post("/api/cards/generate-from-pdf", data={
                "skip_pages": "5", "limit_chunks": "2", "limit_cards": "3"
            }, files={"file": ("book.pdf", b"%PDF-1.4\nmock", "application/pdf")})
        self.assertEqual(response.status_code, 200, response.text)
        self.assertFalse(seen[0].exists())

    def test_llm_failure_returns_service_error(self):
        with patch("app.controllers.card_controller.CardService", side_effect=RuntimeError("offline")):
            response = self.client.post("/api/cards/generate", json={"definitions": [
                {"term": "Term", "definition": "Text"}
            ]})
        self.assertEqual(response.status_code, 503)

    def test_frontend_preflight(self):
        response = self.client.options("/api/cards/generate", headers={
            "Origin": "http://localhost:5173", "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers["access-control-allow-origin"], "http://localhost:5173")


if __name__ == "__main__":
    unittest.main()
