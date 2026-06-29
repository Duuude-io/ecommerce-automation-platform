import time
import uuid
from automation_db import get_conn, release_conn, RealDictCursor


def load_users():
    conn = get_conn()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT * FROM users")
        rows = cur.fetchall()

        return [dict(row) for row in rows]

    finally:
        release_conn(conn)


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

        return [dict(row) for row in rows]

    finally:
        release_conn(conn)


def create_session(
    user_id, device="Unknown Device", ip="Unknown IP"
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

            # Check for existing session for re-use
            cur.execute("""
                SELECT *
                FROM sessions
                WHERE user_id = %s
                AND device = %s
                AND ip = %s
                LIMIT 1
            """, (user_id, device, ip))

            existing_session = cur.fetchone()

            if existing_session:
                cur.execute("""
                    UPDATE sessions
                    SET last_seen = %s
                    WHERE id = %s
                """, (
                    time.time(),
                    existing_session["id"]
                ))

                print("REUSING EXISTING SESSION:", existing_session["id"])

                return dict(existing_session)

            # Get all user sessions to Keep max 5 sessions
            cur.execute("""
                SELECT id
                FROM sessions
                WHERE user_id = %s
                ORDER BY created_at ASC
            """, (user_id,))

            sessions = cur.fetchall()

            if len(sessions) >= 5:
                oldest_session_id = sessions[0]["id"]

                cur.execute("""
                    DELETE FROM sessions
                    WHERE id = %s
                """, (oldest_session_id,))

                print("REMOVED OLDEST SESSION:", oldest_session_id)

            # Insert new session
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
