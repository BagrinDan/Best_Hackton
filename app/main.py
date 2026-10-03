import uvicorn
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from pathlib import Path

from app.controllers.card_controller import CARDS_DIR, router as card_router

load_dotenv(Path(__file__).resolve().parents[1] / ".env", override=False)


app = FastAPI(
    title="My FastAPI App",
    description="Базовый шаблон API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in os.getenv(
        "FRONTEND_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000"
    ).split(",") if origin.strip()],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)
CARDS_DIR.mkdir(parents=True, exist_ok=True)
app.include_router(card_router)
app.mount("/cards", StaticFiles(directory=CARDS_DIR), name="cards")

@app.get("/")
async def read_root():
    return {"message": "Hello World"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="127.0.0.1", port=20000, reload=True)
