from automation_db import get_conn, release_conn, RealDictCursor
import json


def get_order_items(order_id):
    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT *
                FROM order_items
                WHERE order_id = %s
            """, (order_id,))
            rows = cur.fetchall()

            return [
                {
                    "productId": r["product_id"],
                    "quantity": r["quantity"],
                    "deliveryOptionId": r["delivery_option_id"],
                    "estimatedDeliveryTime": r["estimated_delivery"]
                }
                for r in rows
            ]
    finally:
        release_conn(conn)


def get_user_orders(user_id):
    conn = get_conn()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("""
            SELECT * FROM orders
            WHERE user_id = %s
            ORDER BY created_at DESC
        """, (user_id,))

        rows = cur.fetchall()
        orders = []

        for r in rows:
            orders.append({
                "id": r["id"],
                "userId": r["user_id"],
                "orderNumber": r["order_number"],
                "status": r["status"],
                "orderTime": r["created_at"],
                "subTotalCents": r["sub_total_cents"],
                "taxCents": r["tax_cents"],
                "shippingCents": r["shipping_cents"],
                "totalCostCents": r["total_cents"],
                "items": get_order_items(r["id"])
            })

        return orders

    finally:
        release_conn(conn)


def create_order(order):
    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                INSERT INTO orders (
                    id,
                    user_id,
                    order_number,
                    status,
                    created_at,
                    sub_total_cents,
                    tax_cents,
                    shipping_cents,
                    total_cents,
                    billing_json
                )
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """, (
                order["id"],
                order["userId"],
                order["orderNumber"],
                order.get("status", "processing"),
                order["orderTime"],
                order["subTotalCents"],
                order["taxCents"],
                order["shippingCents"],
                order["totalCostCents"],
                json.dumps(order["billingDetails"])
            ))

    finally:
        release_conn(conn)


def add_order_items(order_id, items):
    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            for item in items:
                cur.execute("""
                    INSERT INTO order_items (
                        order_id,
                        product_id,
                        quantity,
                        delivery_option_id,
                        estimated_delivery
                    )
                    VALUES (%s,%s,%s,%s,%s)
                """, (
                    order_id,
                    item["productId"],
                    item["quantity"],
                    item["deliveryOptionId"],
                    item.get("estimatedDeliveryTime")
                ))

    finally:
        release_conn(conn)


def create_order_in_db(order):
    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                INSERT INTO orders (
                    id,
                    user_id,
                    order_number,
                    status,
                    created_at,
                    sub_total_cents,
                    tax_cents,
                    shipping_cents,
                    total_cents,
                    billing_json
                )
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """, (
                order["id"],
                order["userId"],
                order["orderNumber"],
                order.get("status", "processing"),
                order["orderTime"],
                order["subTotalCents"],
                order["taxCents"],
                order["shippingCents"],
                order["totalCostCents"],
                json.dumps(order["billingDetails"])
            ))

        return order["id"]

    finally:
        release_conn(conn)


def cancel_order_in_db(order_id: str, user_id: str):
    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                DELETE FROM orders
                WHERE id = %s AND user_id = %s
            """, (order_id, user_id))

    finally:
        release_conn(conn)
