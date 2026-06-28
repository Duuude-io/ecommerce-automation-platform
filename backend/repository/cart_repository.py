import time
import uuid
from automation_db import get_conn, release_conn, RealDictCursor


def create_cart(user_id):
    cart_id = str(uuid.uuid4())
    now = time.time()

    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                INSERT INTO carts (
                    id,
                    user_id,
                    created_at,
                    updated_at
                )
                VALUES (%s, %s, %s, %s)
            """, (
                cart_id,
                user_id,
                now,
                now
            ))

        return cart_id
    finally:
        release_conn(conn)


def get_cart_by_user(user_id):
    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT *
                FROM carts
                WHERE user_id = %s
                LIMIT 1
            """, (user_id,))

            return cur.fetchone()
    finally:
        release_conn(conn)


def get_or_create_cart(user_id):
    cart = get_cart_by_user(user_id)

    if cart:
        return cart

    cart_id = create_cart(user_id)
    return get_cart_by_user(user_id)


def add_item_to_cart(cart_id, product_id, quantity=1, delivery_option_id='1'):
    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:

            cur.execute("""
                SELECT *
                FROM cart_items
                WHERE cart_id = %s
                AND product_id = %s
                LIMIT 1
            """, (cart_id, product_id))

            existing = cur.fetchone()

            if existing:
                cur.execute("""
                    UPDATE cart_items
                    SET quantity = quantity + %s
                    WHERE cart_id = %s
                    AND product_id = %s
                """, (
                    quantity,
                    cart_id,
                    product_id
                ))
            else:
                cur.execute("""
                    INSERT INTO cart_items (
                        cart_id,
                        product_id,
                        quantity,
                        delivery_option_id
                    )
                    VALUES (%s, %s, %s, %s)
                """, (
                    cart_id,
                    product_id,
                    quantity,
                    delivery_option_id
                ))
    finally:
        release_conn(conn)


def get_cart_items(cart_id):
    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT *
                FROM cart_items
                WHERE cart_id = %s
            """, (cart_id,))

            return cur.fetchall()
    finally:
        release_conn(conn)


def remove_cart_item(cart_id, product_id):
    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                DELETE FROM cart_items
                WHERE cart_id = %s
                AND product_id = %s
            """, (
                cart_id,
                product_id
            ))
    finally:
        release_conn(conn)


def update_cart_quantity(cart_id, product_id, quantity):
    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                UPDATE cart_items
                SET quantity = %s
                WHERE cart_id = %s
                AND product_id = %s
            """, (
                quantity,
                cart_id,
                product_id
            ))
    finally:
        release_conn(conn)
