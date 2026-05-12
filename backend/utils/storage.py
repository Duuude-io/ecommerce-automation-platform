import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
USERS_FILE = BASE_DIR / "users.json"


def load_users():
    if not USERS_FILE.exists():
        return []

    with open(USERS_FILE, "r") as f:
        return json.load(f)
    for user in users:
        # Using the string directly to avoid circular imports with AuthState
        user.setdefault("auth_state", "CREATE_ACCOUNT")
    return users


def save_users(users):
    with open(USERS_FILE, "w") as f:
        json.dump(users, f, indent=2)
