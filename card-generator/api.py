"""
API REST pentru colegi
Expune pipeline-ul ca endpoint HTTP
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from pathlib import Path
from main import generate_card_from_definition


app = FastAPI(title="Card Generator API", version="1.0")

# CORS (pentru site-ul colegilor)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # În producție: domeniul colegilor
    allow_methods=["*"],
    allow_headers=["*"],
)

# Servește fișierele statice din cards/
app.mount("/cards", StaticFiles(directory="cards"), name="cards")


# ============ MODELE ============

class DefinitionRequest(BaseModel):
    definitie: str
    with_image: bool = True


class CardResponse(BaseModel):
    concept: str
    slug: str
    svg_url: str
    image_url: str | None
    data: dict


# ============ ENDPOINTS ============

@app.get("/")
def root():
    return {
        "name": "Card Generator API",
        "version": "1.0",
        "endpoints": {
            "POST /generate": "Generează card din definiție",
            "GET /cards/{slug}.svg": "Card SVG",
            "GET /cards/{slug}.png": "Imagine PNG",
        }
    }


@app.post("/generate", response_model=CardResponse)
def generate(request: DefinitionRequest):
    """
    Primește o definiție, returnează un card.
    """
    if not request.definitie or len(request.definitie.strip()) < 10:
        raise HTTPException(400, "Definiție prea scurtă")
    
    result = generate_card_from_definition(
        request.definitie,
        with_image=request.with_image
    )
    
    if not result:
        raise HTTPException(500, "Generare eșuată")
    
    base_url = "http://localhost:8000"
    
    return CardResponse(
        concept=result["concept"],
        slug=result["slug"],
        svg_url=f"{base_url}/cards/{result['slug']}.svg",
        image_url=f"{base_url}/cards/{result['slug']}.png" if result.get("image_path") else None,
        data=result["data"],
    )


@app.get("/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

