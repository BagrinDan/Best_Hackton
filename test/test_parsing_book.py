import json
import unittest
from unittest.mock import MagicMock, patch

from app.core.parsing_book import ParsingBook, _norm


class ParsingBookTests(unittest.TestCase):
    def test_backend_worker_defaults_and_override(self):
        self.assertEqual(ParsingBook().max_workers, 1)
        self.assertEqual(ParsingBook(backend="openai").max_workers, 4)
        self.assertEqual(ParsingBook(max_workers=2).max_workers, 2)

    def test_request_uses_configured_timeout(self):
        response = MagicMock()
        response.read.return_value = json.dumps({"response": json.dumps({"definitions": []})}).encode()
        response.__enter__.return_value = response
        with patch("app.core.parsing_book.urlopen", return_value=response) as request:
            parser = ParsingBook(request_timeout=420)
            self.assertEqual(parser.llm_call("source"), [])
            self.assertEqual(request.call_args.kwargs["timeout"], 420)
            parser.llm_call("source", timeout=12)
            self.assertEqual(request.call_args.kwargs["timeout"], 12)

    def test_verification_keeps_source_quote_and_rejects_invention(self):
        parser = ParsingBook()
        source = "Forța este o mărime fizică."
        items = [
            {"term": "Forța", "definition": "o mărime fizică", "quote": source},
            {"term": "Invented", "definition": "made up", "quote": "This sentence is absent from the book."},
        ]
        with patch.object(parser, "llm_call", return_value=items):
            result = parser._process_chunk((1, {"text": source, "start_page": 9, "end_page": 9}))
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["page"], 9)
        self.assertEqual(_norm("ma\u0306rime\u00ad fizică"), _norm("mărime fizică"))

    def test_all_failed_chunks_raise_instead_of_returning_empty(self):
        parser = ParsingBook()
        with patch.object(parser, "extract_pages", return_value=[]), patch.object(
            parser, "chunking", return_value=[{"text": "source"}]
        ), patch.object(parser, "_process_chunk", return_value=None):
            with self.assertRaisesRegex(RuntimeError, "All extraction chunks failed"):
                parser.parsing_book()

    def test_partial_failure_preserves_successful_definitions(self):
        parser = ParsingBook()
        definition = {"term": "Forța", "definition": "source", "quote": "source"}
        with patch.object(parser, "extract_pages", return_value=[]), patch.object(
            parser, "chunking", return_value=[{}, {}]
        ), patch.object(parser, "_process_chunk", side_effect=[None, [definition]]):
            self.assertEqual(parser.parsing_book(), [definition])


if __name__ == "__main__":
    unittest.main()
