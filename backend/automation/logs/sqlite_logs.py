import json
import time
from automation_db import get_conn
from automation.logs.normalize_logs import normalize_payload


def already_logged(event, payload, handler_name):
    with get_conn() as conn:
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

    return result is not None


def log_event(event_name, payload, handler_name, status="success"):
    normalized = normalize_payload(payload)

    with get_conn() as conn:
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
            normalized["user"]["userId"],
            json.dumps(normalized),
            status,
            time.time(),
            normalized["user"].get("name"),
            normalized["user"].get("email"),
            normalized["user"].get("phone")
        ))
