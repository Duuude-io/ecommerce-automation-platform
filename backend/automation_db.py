
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

            print(" 🛠️      users table ready  ")

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

            print(" 🛠️      sessions table ready   ")

    finally:
        release_conn(conn)


def init_orders_table():
    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS orders (
                    id TEXT PRIMARY KEY,
                    user_id TEXT,
                    order_number TEXT,
                    status TEXT,
                    created_at TEXT,

                    sub_total_cents INTEGER,
                    tax_cents INTEGER,
                    shipping_cents INTEGER,
                    total_cents INTEGER,

                    billing_json TEXT
                )
                """)

        print(" 🛠️      orders table ready ")

    finally:
        release_conn(conn)


def init_order_items_table():
    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS order_items (
                    id SERIAL PRIMARY KEY,
                    order_id TEXT,
                    product_id TEXT,
                    quantity INTEGER,
                    delivery_option_id TEXT,
                    estimated_delivery TEXT
                )
                """)

        print(" 🛠️      ordered_Items table ready   ")

    finally:
        release_conn(conn)


def init_receipts_table():
    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS order_items (
                    id SERIAL PRIMARY KEY,
                    order_id TEXT,
                    product_id TEXT,
                    quantity INTEGER,
                    delivery_option_id TEXT,
                    estimated_delivery TEXT
                )
                """)

        print(" 🛠️      receipts table ready   ")

    finally:
        release_conn(conn)


def init_addresses_table():
    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS addresses (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,

                    full_name TEXT NOT NULL,
                    phone TEXT NOT NULL,
                    street_address TEXT NOT NULL,
                    city TEXT NOT NULL,
                    state TEXT NOT NULL,
                    country TEXT NOT NULL,

                    is_default INTEGER DEFAULT 0
                )
            """)

        print(" 🛠️      addresses table ready   ")

    finally:
        release_conn(conn)


def init_payment_methods_table():
    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS payment_methods (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,

                    card_type TEXT,
                    card_name TEXT,
                    last16 TEXT,
                    expiry TEXT,
                    cvv TEXT,
                    billing_zip TEXT,

                    is_default BOOLEAN DEFAULT FALSE
                )
            """)
        print(" 🛠️      payment_methods table ready ")
    finally:
        release_conn(conn)


def init_db():

    init_logs_table()
    init_users_table()
    init_sessions_table()
    init_orders_table()

    init_order_items_table()
    init_receipts_table()
    init_addresses_table()
    init_payment_methods_table()
