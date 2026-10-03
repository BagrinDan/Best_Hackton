import json
import tempfile
import unittest
import xml.etree.ElementTree as ET
from pathlib import Path
from unittest.mock import patch

from app.core.parsing_book import ParsingBook
from app.core.svg_generator import generate_card_svg
from app.services.card_service import CardService, parser_from_environment


def visual_plan():
    return {
        "layout": "formula", "subtipo": "", "formula": "V = m / ρ",
        "explicatie_vizuala": "Volumul depinde de masă și densitate.",
        "elemente": [
            {"simbol": symbol, "nume": symbol, "reprezentare": "", "emoji": "💡", "culoare": "#4A90E2"}
            for symbol in ("V", "m", "ρ")
        ],
        "operatori": ["=", "÷"],
    }


class CardServiceTests(unittest.TestCase):
    def test_environment_selects_provider_and_cli_overrides_model(self):
        with patch("app.services.card_service.load_dotenv") as load, patch.dict(
            "os.environ", {"LLM_BACKEND": "openrouter", "LLM_MODEL": "configured-model", "OPENROUTER_API_KEY": "test-key"}, clear=True
        ):
            parser = parser_from_environment(model="explicit-model")
            self.assertEqual(parser.backend, "openai")
            self.assertEqual(parser.model, "explicit-model")
            self.assertEqual(parser.base_url, "https://openrouter.ai/api/v1")
            self.assertEqual(parser.api_key, "test-key")
            self.assertEqual(load.call_args.args[0].name, ".env")
            self.assertFalse(load.call_args.kwargs["override"])

    def test_local_default_needs_no_api_key(self):
        with patch("app.services.card_service.load_dotenv"), patch.dict("os.environ", {}, clear=True):
            self.assertEqual(parser_from_environment().backend, "ollama")

    def test_book_pipeline_preserves_source_and_writes_preview(self):
        parser = ParsingBook()
        definitions = [
            {"term": "Volumul", "definition": "V = m / ρ", "quote": "source quote", "page": 12},
            {"term": "Volumul", "definition": "Another definition", "quote": "other quote", "page": 13},
        ]
        with tempfile.TemporaryDirectory() as directory, patch.object(
            parser, "parsing_book", return_value=definitions
        ) as extract, patch.object(parser, "_ask", side_effect=[visual_plan(), visual_plan()]), patch.object(
            parser, "generate_image", side_effect=AssertionError("Raster generation must not run")
        ):
            cards = CardService(parser, directory).generate_from_book(limit_chunks=2)
            extract.assert_called_once_with(limit_chunks=2)
            self.assertEqual(cards[0]["quote"], "source quote")
            self.assertEqual(cards[0]["page"], 12)
            self.assertNotEqual(cards[0]["image"], cards[1]["image"])
            svg = ET.parse(Path(directory) / cards[0]["image"])
            texts = [node.text.strip() for node in svg.iter("{http://www.w3.org/2000/svg}text")]
            self.assertLess(texts.index("="), texts.index("÷"))
            self.assertIn(cards[0]["image"], (Path(directory) / "index.html").read_text())
            self.assertEqual(len(json.loads((Path(directory) / "index.json").read_text())), 2)

    def test_failed_or_malformed_plan_keeps_definition(self):
        for failure in (RuntimeError("offline"), {"layout": "formula"}):
            with self.subTest(failure=failure), tempfile.TemporaryDirectory() as directory:
                parser = ParsingBook()
                kwargs = {"side_effect": failure} if isinstance(failure, Exception) else {"return_value": failure}
                with patch.object(parser, "_ask", **kwargs):
                    card = CardService(parser, directory).generate_cards([
                        {"term": "Forța", "definition": "A source definition", "page": 3}
                    ])[0]
                self.assertIn("generation_error", card)
                self.assertIn("A source definition", (Path(directory) / card["image"]).read_text())

    def test_svg_escapes_model_text_and_color_attributes(self):
        plan = visual_plan()
        plan.update(concept="A & B", definitie_scurta="x < y")
        plan["elemente"][0].update(emoji="<script>", culoare='red" onload="alert(1)')
        svg = generate_card_svg(plan)
        ET.fromstring(svg)
        self.assertNotIn("onload=", svg)
        self.assertIn("&lt;script&gt;", svg)

    def test_all_layouts_generate_valid_xml(self):
        for layout in ("formula", "flow", "geometric", "proprietati", "simplu"):
            for subtype in (("reflexie", "refractie", "unghi_incidenta", "unghi_reflexie") if layout == "geometric" else ("",)):
                with self.subTest(layout=layout, subtype=subtype):
                    plan = visual_plan()
                    plan.update(layout=layout, subtipo=subtype, concept="Test", definitie_scurta="Definition")
                    ET.fromstring(generate_card_svg(plan))


if __name__ == "__main__":
    unittest.main()
