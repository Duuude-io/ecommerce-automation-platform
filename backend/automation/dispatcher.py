handlers = {}


def register(event_name, func):
    if event_name not in handlers:
        handlers[event_name] = []

    handlers[event_name].append(func)


def dispatch(event_name, payload):
    print(f"EVENT DISPATCHED -> {event_name}")

    if event_name not in handlers:
        print("No handlers found")
        return

    for handler in handlers[event_name]:
        handler(payload)
