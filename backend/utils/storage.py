import json
from pathlib import Path
import time
import uuid

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"

USERS_FILE = DATA_DIR / "users.json"
ORDERS_FILE = DATA_DIR / "orders.json"
RECEIPTS_FILE = DATA_DIR / "receipts.json"
SESSIONS_FILE = DATA_DIR / "active_sessions.json"


def load_users():
    if not USERS_FILE.exists():
        return []

    with open(USERS_FILE, "r") as f:
        users = json.load(f)

    for user in users:
        user.setdefault("auth_state", "CREATE_ACCOUNT")

    return users


def save_users(users):
    with open(USERS_FILE, "w") as f:
        json.dump(users, f, indent=2)


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
    if not SESSIONS_FILE.exists():
        return {}

    try:
        with open(SESSIONS_FILE, "r") as f:
            return json.load(f)

    except json.JSONDecodeError:
        return {}


def save_sessions(sessions):
    with open(SESSIONS_FILE, "w") as f:
        json.dump(sessions, f, indent=2)


def create_session(
    user_id,
    device="Unknown Device",
    ip="Unknown IP"
):
    sessions = load_sessions()

    session = {
        "id": str(uuid.uuid4()),
        "device": device,
        "ip": ip,
        "created_at": time.time(),
        "last_seen": time.time()
    }

    sessions.setdefault(user_id, []).append(session)

    save_sessions(sessions)

    return session


def update_session_activity(
    user_id,
    session_id
):
    sessions = load_sessions()

    user_sessions = sessions.get(
        user_id,
        []
    )

    for session in user_sessions:

        if session["id"] == session_id:

            session["last_seen"] = time.time()

            print("UPDATE SESSION:", user_id, session_id)
            break

    save_sessions(sessions)
