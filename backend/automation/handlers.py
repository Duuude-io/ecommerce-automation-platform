from .dispatcher import register
from .events import Events


def welcome_user(data):
    print("🔥 AUTOMATION TRIGGERED")
    print("User created:", data)


def send_welcome_email(data):

    if data.get("email"):
        print(f"📧 Sending welcome EMAIL to {data['email']}")

    elif data.get("phone"):
        print(f"📱 Sending welcome SMS to {data['phone']}")

    else:
        print("⚠️ No contact method found")


def order_received(data):
    print(f"Automation: Order {data['orderId']} received")


register(Events.USER_CREATED, welcome_user,)
register(Events.USER_CREATED, send_welcome_email)
register(Events.ORDER_CREATED, order_received)
