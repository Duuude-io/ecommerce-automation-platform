import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "database"
DATA_DIR.mkdir(exist_ok=True)

DB_PATH = DATA_DIR / "automation.db"


def get_conn():
    conn = sqlite3.connect(
        DB_PATH,
        timeout=30,
        check_same_thread=False
    )
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def init_logs_table():
    with get_conn() as conn:
        cur = conn.cursor()

        cur.execute("""
        CREATE TABLE IF NOT EXISTS automation_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event TEXT,
            handler TEXT,
            user_id TEXT,
            payload TEXT,
            status TEXT,
            timestamp REAL,
            user_name TEXT,
            email TEXT,
            phone TEXT
        )
        """)

    print(" ⚙️      automation_logs table ready   🛠️")


def init_users_table():
    with get_conn() as conn:
        cursor = conn.cursor()

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE,
            phone TEXT UNIQUE,
            password_hash TEXT NOT NULL,

            verified_email INTEGER DEFAULT 0,
            verified_phone INTEGER DEFAULT 0,

            auth_state TEXT DEFAULT 'CREATE_ACCOUNT',

            pending_email TEXT,
            pending_phone TEXT,

            created_at TEXT NOT NULL
        )
        """)

    print("🛠️ users table ready")


def init_sessions_table():
    with get_conn() as conn:
        conn.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            device TEXT,
            ip TEXT,
            created_at REAL,
            last_seen REAL
        )
        """)

    print("🛠️ sessions table ready")


def init_db():
    init_logs_table()
    init_users_table()
    init_sessions_table()
