from automation_db import get_conn, release_conn, RealDictCursor
import uuid


def get_user_addresses(user_id):
    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT * FROM addresses
                WHERE user_id = %s
            """, (user_id,))

            rows = cur.fetchall()

            return [
                {
                    "id": r["id"],
                    "userId": r["user_id"],
                    "fullName": r["full_name"],
                    "phone": r["phone"],
                    "streetAddress": r["street_address"],
                    "city": r["city"],
                    "state": r["state"],
                    "country": r["country"],
                    "isDefault": r["is_default"],
                }
                for r in rows
            ]

    finally:
        release_conn(conn)


def add_address(user_id, address):
    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            address_id = str(uuid.uuid4())

            cur.execute("""
                INSERT INTO addresses (
                    id,
                    user_id,
                    full_name,
                    phone,
                    street_address,
                    city,
                    state,
                    country,
                    is_default
                )
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """, (
                address_id,
                user_id,
                address["fullName"],
                address["phone"],
                address["streetAddress"],
                address["city"],
                address["state"],
                address["country"],
                int(address.get("isDefault", False))
            ))

            return address_id

    finally:
        release_conn(conn)


def delete_address(user_id, address_id):
    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:

            # Was deleted address default?
            cur.execute("""
                SELECT is_default
                FROM addresses
                WHERE id = %s AND user_id = %s
            """, (address_id, user_id))

            row = cur.fetchone()
            if not row:
                return

            was_default = row["is_default"]

            # Delete it
            cur.execute("""
                DELETE FROM addresses
                WHERE id = %s AND user_id = %s
            """, (address_id, user_id))

            # If deleted default, promote another
            if was_default:
                cur.execute("""
                    SELECT id
                    FROM addresses
                    WHERE user_id = %s
                    LIMIT 1
                """, (user_id,))

                next_address = cur.fetchone()

                if next_address:
                    cur.execute("""
                        UPDATE addresses
                        SET is_default = 1
                        WHERE id = %s
                    """, (next_address["id"],))

    finally:
        release_conn(conn)


def update_address(user_id, address_id, address):
    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                UPDATE addresses
                SET full_name = %s,
                    phone = %s,
                    street_address = %s,
                    city = %s,
                    state = %s,
                    country = %s
                WHERE id = %s AND user_id = %s
            """, (
                address["fullName"],
                address["phone"],
                address["streetAddress"],
                address["city"],
                address["state"],
                address["country"],
                address_id,
                user_id
            ))
    finally:
        release_conn(conn)


def set_default_address(user_id, address_id):
    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Remove default from all user's addresses
            cur.execute("""
                UPDATE addresses
                SET is_default = 0
                WHERE user_id = %s
            """, (user_id,))

            # Set chosen one as default
            cur.execute("""
                UPDATE addresses
                SET is_default = 1
                WHERE user_id = %s AND id = %s
            """, (
                user_id,
                address_id
            ))

    finally:
        release_conn(conn)


def get_user_payments(user_id):
    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT * FROM payment_methods
                WHERE user_id = %s
            """, (user_id,))

            rows = cur.fetchall()

            return [
                {
                    "id": r["id"],
                    "userId": r["user_id"],
                    "cardType": r["card_type"],
                    "cardName": r["card_name"],
                    "last16": r["last16"],
                    "expiry": r["expiry"],
                    "cvv": r["cvv"],
                    "billingZip": r["billing_zip"],
                    "isDefault": r["is_default"],
                }
                for r in rows
            ]

    finally:
        release_conn(conn)


def add_payment_method(user_id, payment):
    payment_id = str(uuid.uuid4())

    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                INSERT INTO payment_methods (
                    id,
                    user_id,
                    card_type,
                    card_name,
                    last16,
                    expiry,
                    cvv,
                    billing_zip,
                    is_default
                )
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """, (
                payment_id,
                user_id,
                payment["cardType"],
                payment["cardName"],
                payment["last16"],
                payment["expiry"],
                payment["cvv"],
                payment["billingZip"],
                payment.get("isDefault", False)
            ))

    finally:
        release_conn(conn)

    return payment_id


def delete_payment_method(user_id, payment_id):
    was_default = False

    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Check if deleting default
            cur.execute("""
                SELECT is_default
                FROM payment_methods
                WHERE id = %s AND user_id = %s
            """, (payment_id, user_id))

            payment = cur.fetchone()
            was_default = payment and payment["is_default"]

            # Delete payment
            cur.execute("""
                DELETE FROM payment_methods
                WHERE id = %s AND user_id = %s
            """, (payment_id, user_id))

            # If deleted card was default, promote another card
            if was_default:
                cur.execute("""
                    SELECT id
                    FROM payment_methods
                    WHERE user_id = %s
                    LIMIT 1
                """, (user_id,))

                next_payment = cur.fetchone()

                if next_payment:
                    cur.execute("""
                        UPDATE payment_methods
                        SET is_default = TRUE
                        WHERE id = %s
                    """, (next_payment["id"],))

    finally:
        release_conn(conn)


def set_default_payment(user_id, payment_id):
    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Reset all to non-default
            cur.execute("""
                UPDATE payment_methods
                SET is_default = FALSE
                WHERE user_id = %s
            """, (user_id,))

            # Set selected one as default
            cur.execute("""
                UPDATE payment_methods
                SET is_default = TRUE
                WHERE user_id = %s
                AND id = %s
            """, (
                user_id,
                payment_id
            ))

    finally:
        release_conn(conn)


def update_payment_method(user_id, payment_id, payment):
    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                UPDATE payment_methods
                SET card_type = %s,
                    card_name = %s,
                    last16 = %s,
                    expiry = %s,
                    cvv = %s,
                    billing_zip = %s
                WHERE id = %s AND user_id = %s
            """, (
                payment["cardType"],
                payment["cardName"],
                payment["last16"],
                payment["expiry"],
                payment["cvv"],
                payment["billingZip"],
                payment_id,
                user_id
            ))
    finally:
        release_conn(conn)
