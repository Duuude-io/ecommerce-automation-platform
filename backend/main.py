# main.py
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from typing import List, Optional
from pydantic import BaseModel
from data.products import products

app = FastAPI(title="Amazon Project Backend")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow frontend access
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
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
def root():
    return {"message": "Welcome to Amazon Project Backend!"}

# Products route


@app.get("/products", response_model=List[ProductModel])
def get_products():
    return products
