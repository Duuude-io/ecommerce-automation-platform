import json
from automation_db import get_conn, release_conn, RealDictCursor


def create_receipt(receipt):
    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                INSERT INTO receipts (
                    id,
                    order_id,
                    user_id,
                    created_at,
                    data
                )
                VALUES (%s,%s,%s,%s,%s)
            """, (
                receipt["receiptId"],
                receipt["orderId"],
                receipt["userId"],
                receipt["createdAt"],
                json.dumps(receipt)
            ))

    finally:
        release_conn(conn)
