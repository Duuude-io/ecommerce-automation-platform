from automation_db import get_conn, release_conn, RealDictCursor
import datetime


def row_to_user(row):
    if not row:
        return None

    return {
        "id": row["id"],
        "name": row["name"],
        "email": row["email"],
        "phone": row["phone"],
        "password": row["password_hash"],
        "pending_email": row["pending_email"],
        "pending_phone": row["pending_phone"],
        "auth_state": row["auth_state"],
        "verified_email": bool(row["verified_email"]),
        "verified_phone": bool(row["verified_phone"])
    }


def get_all_users():
    conn = get_conn()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT * FROM users")
        rows = cur.fetchall()
        return [row_to_user(row) for row in rows]

    finally:
        release_conn(conn)


def get_user_by_id(user_id):
    conn = get_conn()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(
            "SELECT * FROM users WHERE id = %s",
            (user_id,)
        )

       # print("LOOKUP USER_ID:", user_id)
       # print("ALL USER IDS:", [u["id"] for u in get_all_users()])

        row = cur.fetchone()
        return row_to_user(row)

    finally:
        release_conn(conn)


def get_user_by_email(email):
    conn = get_conn()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(
            "SELECT * FROM users WHERE email = %s",
            (email,)
        )
        row = cur.fetchone()
        return row_to_user(row)

    finally:
        release_conn(conn)


def get_user_by_phone(phone):
    conn = get_conn()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(
            "SELECT * FROM users WHERE phone = %s",
            (phone,)
        )
        row = cur.fetchone()
        return row_to_user(row)

    finally:
        release_conn(conn)


def create_user(user):
    now = datetime.datetime.utcnow().isoformat()

    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
            INSERT INTO users (
                id,
                name,
                email,
                phone,
                password_hash,
                pending_email,
                pending_phone,
                auth_state,
                verified_email,
                verified_phone,
                created_at
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
                user["id"],
                user.get("name"),
                user.get("email"),
                user.get("phone"),
                user["password"],
                user.get("pending_email"),
                user.get("pending_phone"),
                user.get("auth_state", "CREATE_ACCOUNT"),
                int(user.get("verified_email", False)),
                int(user.get("verified_phone", False)),
                now
            ))

    finally:
        release_conn(conn)


def update_user(user_id, updates: dict):
    if not updates:
        return

    allowed_fields = {
        "name": "name",
        "email": "email",
        "phone": "phone",
        "password": "password_hash",
        "pending_email": "pending_email",
        "pending_phone": "pending_phone",
        "auth_state": "auth_state",
        "verified_email": "verified_email",
        "verified_phone": "verified_phone"
    }

    fields = []
    values = []

    for key, value in updates.items():
        if key in allowed_fields:
            db_column = allowed_fields[key]

            if key in ["verified_email", "verified_phone"]:
                value = int(bool(value))

            fields.append(f"{db_column} = %s")
            values.append(value)

    if not fields:
        return

    values.append(user_id)
    query = f"""
        UPDATE users
        SET {", ".join(fields)}
        WHERE id = %s
    """

    conn = get_conn()
    try:

        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(query, tuple(values))

    finally:
        release_conn(conn)
