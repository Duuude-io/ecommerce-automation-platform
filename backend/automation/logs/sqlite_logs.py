import json
import time
from automation_db import get_conn, release_conn, RealDictCursor
from automation.logs.normalize_logs import normalize_payload


def already_logged(event, payload, handler_name):
    conn = get_conn()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT 1 FROM automation_logs
            WHERE event = %s
            AND handler = %s
            AND user_id = %s
            LIMIT 1
        """, (
            event,
            handler_name,
            payload.get("userId")
        ))

        result = cur.fetchone()
    finally:
        release_conn(conn)

    return result is not None


def log_event(event_name, payload, handler_name, status="success"):
    normalized = normalize_payload(payload)

    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
            INSERT INTO automation_logs (
                event,
                handler,
                user_id,
                payload,
                status,
                timestamp,
                user_name,
                email,
                phone
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
                event_name,
                handler_name,
                normalized["user"]["userId"],
                json.dumps(normalized),
                status,
                time.time(),
                normalized["user"].get("name"),
                normalized["user"].get("email"),
                normalized["user"].get("phone")
            ))

    finally:
        release_conn(conn)
