import json
from pathlib import Path
import time
import uuid
from automation_db import get_conn

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"

ORDERS_FILE = DATA_DIR / "orders.json"
RECEIPTS_FILE = DATA_DIR / "receipts.json"


def load_users():
    with get_conn() as conn:
        cur = conn.cursor()
        cur.execute("SELECT * FROM users")
        rows = cur.fetchall()

        return [dict(row) for row in rows]


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
    with get_conn() as conn:
        cur = conn.cursor()
        cur.execute("SELECT * FROM sessions")
        rows = cur.fetchall()

        sessions = {}

        for row in rows:
            session = dict(row)
            user_id = session["user_id"]

            sessions.setdefault(user_id, []).append(session)

        return sessions


def get_user_sessions(user_id: str):
    with get_conn() as conn:
        cur = conn.cursor()
        cur.execute("""
            SELECT * FROM sessions
            WHERE user_id = ?
        """, (user_id,))
        return [dict(row) for row in cur.fetchall()]


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

    with get_conn() as conn:
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO sessions (
                id,
                user_id,
                device,
                ip,
                created_at,
                last_seen
            )
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            session["id"],
            user_id,
            session["device"],
            session["ip"],
            session["created_at"],
            session["last_seen"]
        ))

    return session


def update_session_activity(user_id, session_id):
    with get_conn() as conn:
        cur = conn.cursor()
        cur.execute("""
            UPDATE sessions
            SET last_seen = ?
            WHERE user_id = ? AND id = ?
        """, (
            time.time(),
            user_id,
            session_id
        ))

    print("UPDATE SESSION:", user_id, session_id)
