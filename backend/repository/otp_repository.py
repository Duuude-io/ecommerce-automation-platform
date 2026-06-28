from automation_db import get_conn, release_conn, RealDictCursor


def create_otp(user_id, purpose, otp, target, created_at):
    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                INSERT INTO otp_codes (
                    user_id,
                    purpose,
                    otp,
                    target,
                    created_at
                )
                VALUES (%s, %s, %s, %s, %s)
            """, (
                user_id,
                purpose,
                otp,
                target,
                created_at
            ))
    finally:
        release_conn(conn)


def get_otp(user_id, purpose):
    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT *
                FROM otp_codes
                WHERE user_id = %s
                AND purpose = %s
                LIMIT 1
            """, (user_id, purpose))

            return cur.fetchone()
    finally:
        release_conn(conn)


def delete_otp(user_id, purpose):
    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                DELETE FROM otp_codes
                WHERE user_id = %s
                AND purpose = %s
            """, (user_id, purpose))
    finally:
        release_conn(conn)


def cleanup_expired_otps(expiry_seconds):
    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                DELETE FROM otp_codes
                WHERE EXTRACT(EPOCH FROM NOW()) - created_at > %s
            """, (expiry_seconds,))
    finally:
        release_conn(conn)
