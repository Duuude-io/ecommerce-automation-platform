
import os
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor
from psycopg2.pool import SimpleConnectionPool

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
db_pool = SimpleConnectionPool(
    1,   # min connections
    10,  # max connections
    DATABASE_URL
)


def get_conn():
    conn = db_pool.getconn()
    conn.autocommit = True
    return conn


def release_conn(conn):
    db_pool.putconn(conn)


def init_logs_table():
    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS automation_logs (
                    id SERIAL PRIMARY KEY,
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

    finally:
        release_conn(conn)


def init_users_table():
    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
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

            print(" 🛠️      users table ready")

    finally:
        release_conn(conn)


def init_sessions_table():
    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS sessions (
                    id TEXT PRIMARY KEY,
                    user_id TEXT,
                    device TEXT,
                    ip TEXT,
                    created_at REAL,
                    last_seen REAL
                )
                """)

            print(" 🛠️      sessions table ready")

    finally:
        release_conn(conn)


def init_db():
    init_logs_table()
    init_users_table()
    init_sessions_table()
