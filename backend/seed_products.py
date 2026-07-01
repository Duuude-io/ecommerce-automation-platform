import json
from pathlib import Path
from repository.product_repository import create_product

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
GENERATED_PRODUCTS_FILE = DATA_DIR / "generated-products.json"


with open(GENERATED_PRODUCTS_FILE, "r", encoding="utf-8") as f:
    products = json.load(f)


for product in products:
    create_product(product)


print(f"✅ Seeded {len(products)} products")
