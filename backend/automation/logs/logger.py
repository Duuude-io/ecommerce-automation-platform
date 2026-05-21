from automation.logs.schema import AutomationLog, AutomationUser
from automation_db import get_conn
import json
import time


def log_event(event_name, payload, handler_name, status="success"):
    conn = get_conn()
    cur = conn.cursor()

    user = AutomationUser(
        id=payload.get("userId"),
        email=payload.get("email"),
        phone=payload.get("phone"),
        name=payload.get("name"),
    )

    log = AutomationLog(
        event=event_name,
        handler=handler_name,
        status=status,
        user=user,
        payload=payload
    )

    cur.execute("""
        INSERT INTO automation_logs 
        (event, handler, user_id, payload, status, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        log.event,
        log.handler,
        log.user.id,
        json.dumps(log.to_dict()["payload"]),
        log.status,
        log.timestamp
    ))

    conn.commit()
    conn.close()


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

    exists = cur.fetchone() is not None
    conn.close()

    return exists
