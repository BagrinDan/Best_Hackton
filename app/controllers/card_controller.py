"""HTTP endpoints for the SVG card service."""

from pathlib import Path
from tempfile import TemporaryDirectory
from typing import Annotated
from uuid import uuid4

from fastapi import APIRouter, File, Form, HTTPException, Request, UploadFile
from pydantic import BaseModel, Field, StringConstraints
from loguru import logger

from app.services.card_service import CardService, parser_from_environment


CARDS_DIR = Path(__file__).resolve().parents[2] / "cards" / "svg"
router = APIRouter(prefix="/api/cards", tags=["Cards"])
NonemptyText = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1)]


class DefinitionInput(BaseModel):
    term: NonemptyText
    definition: NonemptyText
    quote: str = ""
    page: int | None = Field(default=None, ge=1)


class GenerateCardsRequest(BaseModel):
    definitions: list[DefinitionInput] = Field(min_length=1, max_length=100)


def generation_result(request: Request, batch_id: str, cards: list[dict]) -> dict:
    """Return URLs using the request host so frontends need no filesystem paths."""
    return {
        "batch_id": batch_id,
        "count": len(cards),
        "preview_url": str(request.url_for("cards", path=f"{batch_id}/index.html")),
        "cards": [
            {
                **card,
                "svg_url": str(request.url_for("cards", path=f"{batch_id}/{card['image']}")),
                "illustration_url": str(request.url_for("cards", path=f"{batch_id}/{card['illustration']}")),
            }
            for card in cards
        ],
    }


def generation_error(exc: Exception) -> HTTPException:
    logger.error(f"Card generation request failed: {exc}")
    return HTTPException(status_code=503, detail="Card generation failed. Check the server logs and LLM configuration.")


@router.post("/generate")
def generate_cards(payload: GenerateCardsRequest, request: Request):
    """Generate SVG cards from definitions already available to the frontend."""
    batch_id = uuid4().hex
    try:
        service = CardService(out_dir=CARDS_DIR / batch_id)
        cards = service.generate_cards([definition.model_dump() for definition in payload.definitions])
    except (RuntimeError, ValueError) as exc:
        raise generation_error(exc) from exc
    return generation_result(request, batch_id, cards)


@router.post("/generate-from-pdf")
def generate_from_pdf(
    request: Request,
    file: Annotated[UploadFile, File(description="Textbook PDF")],
    skip_pages: Annotated[int, Form(ge=0)] = 0,
    limit_chunks: Annotated[int | None, Form(ge=1)] = None,
    limit_cards: Annotated[int | None, Form(ge=1, le=100)] = 20,
):
    """Extract textbook definitions and generate cards. Waits until generation finishes."""
    batch_id = uuid4().hex
    try:
        with TemporaryDirectory(prefix="physicards-") as directory:
            pdf_path = Path(directory) / "book.pdf"
            total = 0
            with pdf_path.open("wb") as output:
                while chunk := file.file.read(1024 * 1024):
                    if total == 0 and not chunk.startswith(b"%PDF-"):
                        raise HTTPException(status_code=400, detail="Upload a valid PDF file.")
                    total += len(chunk)
                    if total > 50 * 1024 * 1024:
                        raise HTTPException(status_code=413, detail="PDF must be at most 50 MB.")
                    output.write(chunk)
            if total == 0:
                raise HTTPException(status_code=400, detail="PDF file is empty.")
            parser = parser_from_environment(pdf_path=pdf_path, skip_pages=skip_pages)
            service = CardService(parser, CARDS_DIR / batch_id)
            cards = service.generate_from_book(limit_chunks=limit_chunks, limit_cards=limit_cards)
    except (RuntimeError, ValueError) as exc:
        raise generation_error(exc) from exc
    finally:
        file.file.close()
    return generation_result(request, batch_id, cards)
