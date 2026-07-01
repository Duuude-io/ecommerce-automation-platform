
import os
from dotenv import load_dotenv
from psycopg2.extras import RealDictCursor
from psycopg2.pool import ThreadedConnectionPool

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
db_pool = ThreadedConnectionPool(
    1,   # min connections
    10,  # max connections
    DATABASE_URL
)

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL missing")


def get_conn():
    conn = db_pool.getconn()
    conn.autocommit = True
    return conn


def release_conn(conn):
    db_pool.putconn(conn)


def init_products_table():
    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS products (
                    id TEXT PRIMARY KEY,
                    sku TEXT UNIQUE NOT NULL,
                    name TEXT NOT NULL,
                    brand TEXT,
                    category TEXT,
                    image TEXT,

                    images JSONB DEFAULT '[]'::jsonb,
                    rating JSONB DEFAULT '{}'::jsonb,

                    price_cents INTEGER NOT NULL,
                    original_price_cents INTEGER,
                    discount_percent INTEGER DEFAULT 0,
                    stock INTEGER DEFAULT 0,

                    description TEXT,

                    specs JSONB DEFAULT '{}'::jsonb,

                    featured BOOLEAN DEFAULT FALSE,
                    created_at BIGINT,

                    size_chart_link TEXT,
                    instructions_link TEXT,
                    warranty_link TEXT,

                    keywords JSONB DEFAULT '[]'::jsonb
                )
            """)

        print(" ⚙️      products table ready   ")
    finally:
        release_conn(conn)


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

        print(" ⚙️      logs table ready   🛠️")

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

            print(" 🛠️      users table ready..  ")

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

            print(" 🛠️      sessions table ready..   ")

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

        print(" 🛠️      orders table ready.. ")

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

    finally:
        release_conn(conn)


def init_receipts_table():
    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS receipts (
                    id TEXT PRIMARY KEY,
                    order_id TEXT NOT NULL,
                    user_id TEXT NOT NULL,
                    created_at TEXT,
                    data TEXT NOT NULL
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

        print(" 🛠️      addresses table ready..   ")

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
        print(" 🛠️      payments table ready.. ")
    finally:
        release_conn(conn)


def init_otp_table():
    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS otp_codes (
                    id SERIAL PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    purpose TEXT NOT NULL,
                    otp TEXT NOT NULL,
                    target TEXT,
                    created_at REAL NOT NULL
                )
            """)

        print(" 🛠️      OTP table ready ")

    finally:
        release_conn(conn)


def init_carts_table():
    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS carts (
                    id TEXT PRIMARY KEY,
                    user_id TEXT UNIQUE NOT NULL,
                    created_at REAL,
                    updated_at REAL
                )
            """)

        print(" 🛠️      carts table ready ")

    finally:
        release_conn(conn)


def init_cart_items_table():
    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS cart_items (
                    id SERIAL PRIMARY KEY,
                    cart_id TEXT NOT NULL,
                    product_id TEXT NOT NULL,
                    quantity INTEGER NOT NULL DEFAULT 1,
                    delivery_option_id TEXT DEFAULT '1'
                )
            """)

    finally:
        release_conn(conn)


def init_db():

    init_products_table()
    init_logs_table()
    init_users_table()
    init_sessions_table()
    init_orders_table()

    init_order_items_table()
    init_receipts_table()
    init_addresses_table()
    init_payment_methods_table()
    init_otp_table()
    init_carts_table()
    init_cart_items_table()
