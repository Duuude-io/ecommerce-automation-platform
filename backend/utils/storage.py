import json
from pathlib import Path
import time
import uuid
from automation_db import get_conn, release_conn, RealDictCursor

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"

ORDERS_FILE = DATA_DIR / "orders.json"
RECEIPTS_FILE = DATA_DIR / "receipts.json"


def load_users():
    conn = get_conn()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT * FROM users")
        rows = cur.fetchall()

        return [dict(row) for row in rows]

    finally:
        release_conn(conn)


def load_orders():
    if not ORDERS_FILE.exists():
        return []

    with open(ORDERS_FILE, "r") as f:
        return json.load(f)


def save_orders(orders):
    with open(ORDERS_FILE, "w") as f:
        json.dump(orders, f, indent=2)


def update_order_status(order_id, status):

    orders = load_orders()

    for order in orders:
        if order["id"] == order_id:
            order["status"] = status

    save_orders(orders)


def load_receipts():

    if not RECEIPTS_FILE.exists():
        return []

    with open(RECEIPTS_FILE, "r") as f:
        return json.load(f)


def save_receipts(receipts):

    with open(RECEIPTS_FILE, "w") as f:
        json.dump(receipts, f, indent=2)


def load_sessions():
    conn = get_conn()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT * FROM sessions")
        rows = cur.fetchall()

        sessions = {}

        for row in rows:
            session = dict(row)
            user_id = session["user_id"]

            sessions.setdefault(user_id, []).append(session)

        return sessions

    finally:
        release_conn(conn)


def get_user_sessions(user_id: str):
    conn = get_conn()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("""
            SELECT * FROM sessions
            WHERE user_id = %s
        """, (user_id,))

        rows = cur.fetchall()
        print("SESSION ROWS:", rows)

        return [dict(row) for row in rows]

    finally:
        release_conn(conn)


def create_session(
    user_id,
    device="Unknown Device",
    ip="Unknown IP"
):

    session = {
        "id": str(uuid.uuid4()),
        "device": device,
        "ip": ip,
        "created_at": time.time(),
        "last_seen": time.time()
    }

    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
            INSERT INTO sessions (
                id,
                user_id,
                device,
                ip,
                created_at,
                last_seen
            )
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
                session["id"],
                user_id,
                session["device"],
                session["ip"],
                session["created_at"],
                session["last_seen"]
            ))

        print("CREATING SESSION:", session["id"], user_id)

    finally:
        release_conn(conn)

    return session


def update_session_activity(user_id, session_id):
    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                UPDATE sessions
                SET last_seen = %s
                WHERE user_id = %s AND id = %s
            """, (
                time.time(),
                user_id,
                session_id
            ))

        print("UPDATE SESSION:", user_id, session_id)

    finally:
        release_conn(conn)
