from fastapi import FastAPI
from typing import List, Optional
from pydantic import BaseModel
from data.products import products
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

app = FastAPI(title="Amazon Project Backend")

# Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ⭐ SERVE IMAGES FOLDER
app.mount("/images", StaticFiles(directory="images"), name="images")
app.mount("/scripts", StaticFiles(directory="scripts"), name="scripts")
app.mount("/styles", StaticFiles(directory="styles"), name="styles")

# Pydantic models


class RatingModel(BaseModel):
    stars: float
    count: int


class ProductModel(BaseModel):
    id: str
    name: str
    image: str
    priceCents: int
    rating: RatingModel
    type: Optional[str] = None
    sizeChartLink: Optional[str] = None


# Root route
@app.get("/")
def serve_home():
    return FileResponse("index.html")

# Products route


@app.get("/products", response_model=List[ProductModel])
def get_products():
    return products
