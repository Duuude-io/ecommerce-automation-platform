from automation.dispatcher import register, listen
from automation.events import Events
import time


@listen(Events.USER_CREATED)
def welcome_user(data):
    print("🔥 AUTOMATION TRIGGERED")
    print("User created:", data)


@listen(Events.USER_CREATED)
def send_welcome_email(data):
    print("📧 Welcome, Prepaing....")

    time.sleep(5)

    if data.get("email"):
        print(f"📧 Sending welcome EMAIL to {data['email']}")

    elif data.get("phone"):
        print(f"📱 Sending welcome SMS to {data['phone']}")

    else:
        print("⚠️ No contact method found")


@listen(Events.ORDER_CREATED)
def order_received(data):
    print(f"Automation: Order {data['orderId']} received")


@listen(Events.OTP_VERIFIED)
def handle_otp_verified(data):
    print("🔥 OTP VERIFIED AUTOMATION")

    if data.get("email"):
        print("Send verified email confirmation")

    if data.get("phone"):
        print("Send verified SMS confirmation")


@listen(Events.USER_FULLY_VERIFIED)
def user_onboarding(data):
    print("🚀 Starting onboarding workflow")


@listen(Events.USER_LOGGED_IN)
def login_analytics(data):
    print("User logged in:", data["userId"])
