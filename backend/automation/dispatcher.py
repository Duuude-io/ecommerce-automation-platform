from threading import Thread
from automation.logs.sqlite_logs import log_event
from repository.user_repository import get_user_by_id

handlers = {}


def listen(event_name):
    def decorator(func):
        register(event_name, func)
        return func
    return decorator


def register(event_name, handler):
    if event_name not in handlers:
        handlers[event_name] = []

    handlers[event_name].append(handler)


def run_handler(handler, payload, event_name):

    handler_name = handler.__name__

    payload = dict(payload or {})

    user_id = payload.get("userId") or payload.get("user_id")

    user = get_user_by_id(user_id) if user_id else None

    payload["userId"] = user_id

    if user:
        payload.setdefault("name", user.get("name"))
        payload.setdefault("email", user.get("email"))
        payload.setdefault("phone", user.get("phone"))

    if user_id is None:
        print("Skipping log: missing user_id")
        return

    try:
        print(f"Running automation: {handler_name}")

        handler(payload)

        log_event(event_name, payload, handler_name, "success")

    except Exception as e:
        print("Automation error:", e)
        log_event(event_name, payload, handler_name, "failed")


def dispatch(event_name, payload):
    print(f"EVENT DISPATCHED -> {event_name}")

    if event_name not in handlers:
        print("No handlers found")
        return

    for handler in handlers[event_name]:
        Thread(
            target=run_handler,
            args=(handler, payload, event_name),
            daemon=True
        ).start()
