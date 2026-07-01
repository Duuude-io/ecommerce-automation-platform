from psycopg2.extras import Json
from automation_db import get_conn, release_conn, RealDictCursor


def create_product(product):
    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                INSERT INTO products (
                    id,
                    sku,
                    name,
                    brand,
                    category,
                    image,
                    images,
                    rating,
                    price_cents,
                    original_price_cents,
                    discount_percent,
                    stock,
                    description,
                    specs,
                    featured,
                    created_at,
                    size_chart_link,
                    instructions_link,
                    warranty_link,
                    keywords
                )
                VALUES (
                    %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s
                )
            """, (
                product["id"],
                product["sku"],
                product["name"],
                product["brand"],
                product["category"],
                product["image"],
                Json(product["images"]),
                Json(product["rating"]),
                product["priceCents"],
                product["originalPriceCents"],
                product["discountPercent"],
                product["stock"],
                product["description"],
                Json(product["specs"]),
                product["featured"],
                product["createdAt"],
                product["sizeChartLink"],
                product["instructionsLink"],
                product["warrantyLink"],
                Json(product["keywords"])
            ))

    finally:
        release_conn(conn)


def get_all_products():
    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT *
                FROM products
                ORDER BY created_at DESC
            """)

            products = cur.fetchall()

            return [
                serialize_product(product) for product in products
            ]

    finally:
        release_conn(conn)


def get_product_by_id(product_id):
    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT *
                FROM products
                WHERE id = %s
                LIMIT 1
            """, (product_id,))

            product = cur.fetchone()

            if not product:
                return None

            return serialize_product(product)

    finally:
        release_conn(conn)


def update_product_stock(product_id, quantity):
    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                UPDATE products
                SET stock = stock - %s
                WHERE id = %s
            """, (quantity, product_id))

    finally:
        release_conn(conn)

  # snake_case to camelCase


def serialize_product(product):
    return {
        "id": product["id"],
        "sku": product["sku"],
        "name": product["name"],
        "brand": product["brand"],
        "category": product["category"],
        "image": product["image"],
        "images": product["images"],
        "rating": product["rating"],
        "priceCents": product["price_cents"],
        "originalPriceCents": product["original_price_cents"],
        "discountPercent": product["discount_percent"],
        "stock": product["stock"],
        "description": product["description"],
        "specs": product["specs"],
        "featured": product["featured"],
        "createdAt": product["created_at"],
        "sizeChartLink": product["size_chart_link"],
        "instructionsLink": product["instructions_link"],
        "warrantyLink": product["warranty_link"],
        "keywords": product["keywords"]
    }
