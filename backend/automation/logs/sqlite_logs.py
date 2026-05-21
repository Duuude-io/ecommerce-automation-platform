import json
import time
from automation_db import get_conn


def already_logged(event, payload, handler_name):
    conn = get_conn()
    cur = conn.cursor()

    cur.execute("""
        SELECT 1 FROM automation_logs
        WHERE event = ?
        AND handler = ?
        AND user_id = ?
        LIMIT 1
    """, (
        event,
        handler_name,
        payload.get("userId")
    ))

    result = cur.fetchone()
    conn.close()

    return result is not None


def log_event(event_name, payload, handler_name, status="success"):
    conn = get_conn()
    cur = conn.cursor()

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
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        event_name,
        handler_name,
        payload.get("userId"),
        json.dumps(payload),
        status,
        time.time(),
        payload.get("name"),
        payload.get("email"),
        payload.get("phone")
    ))

    conn.commit()
    conn.close()
