from threading import Thread

handlers = {}


def register(event_name, handler):
    if event_name not in handlers:
        handlers[event_name] = []

    handlers[event_name].append(handler)


def run_handler(handler, payload):
    try:
        handler(payload)
    except Exception as e:
        print("Automation error:", e)


def dispatch(event_name, payload):
    print(f"EVENT DISPATCHED -> {event_name}")

    if event_name not in handlers:
        print("No handlers found")
        return

    for handler in handlers[event_name]:
        Thread(
            target=run_handler,
            args=(handler, payload),
            daemon=True
        ).start()
