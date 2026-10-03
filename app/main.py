import uvicorn
from fastapi import FastAPI
from typing import Union

app = FastAPI(
    title="My FastAPI App",
    description="Базовый шаблон API",
    version="1.0.0"
)

@app.get("/")
async def read_root():
    return {"message": "Hello World"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=20000, reload=True)