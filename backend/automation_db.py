import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "automation.db"


def get_conn():
    return sqlite3.connect(DB_PATH)


def init_db():
    conn = get_conn()
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS automation_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event TEXT,
        handler TEXT,
        user_id TEXT,
        payload TEXT,
        status TEXT,
        timestamp REAL
    )
    """)

    conn.commit()
    conn.close()
