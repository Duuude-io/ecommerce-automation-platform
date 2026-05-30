from automation.dispatcher import register, listen, dispatch
from automation.events import Events
import time
from utils.storage import update_order_status, load_receipts, save_receipts

import uuid


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


@listen(Events.ORDER_CREATED)
def order_received(data):
    print(f"Automation: Order {data['orderId']} received")


@listen(Events.ORDER_CREATED)
def start_order_workflow(data):

    order_id = data["orderId"]

    print(f"📦 Processing order {order_id}")


"""
@listen(Events.ORDER_PAID)
def pack_order(data):

    update_order_status(data["orderId"], "paid")

    print(f"📦 Packing order {data['orderId']}")

    time.sleep(5)

    dispatch(Events.ORDER_PACKED, data)


@listen(Events.ORDER_PACKED)
def ship_order(data):

    update_order_status(data["orderId"], "packed")

    print(f"🚚 Shipping order {data['orderId']}")

    time.sleep(5)

    dispatch(Events.ORDER_SHIPPED, data)


@listen(Events.ORDER_SHIPPED)
def deliver_order(data):

    update_order_status(data["orderId"], "shipped")

    print(f"✈️ Delivered {data['orderId']}")

    dispatch(Events.ORDER_DELIVERED, data)


@listen(Events.ORDER_DELIVERED)
def complete_order(data):

    update_order_status(data["orderId"], "delivered")

    print(f"🎉 Order completed")
"""


@listen(Events.ORDER_CANCELLED)
def cancel_order_workflow(data):

    update_order_status(data["orderId"], "cancelled")

    print(f"❌ Order {data['orderId']} cancelled")

    dispatch(Events.ORDER_REFUND_INITIATED, data)


@listen(Events.ORDER_CREATED)
def generate_order_receipt(data):

    receipts = load_receipts()

    receipt = {
        "receiptId": str(uuid.uuid4()),
        "orderId": data["orderId"],
        "userId": data["userId"],

        "name": data.get("name"),
        "email": data.get("email"),
        "phone": data.get("phone"),

        "items": data.get("items", []),
        "billingDetails": data.get("billingDetails"),
        "createdAt": data.get("orderTime"),

        "subTotalCents": data.get("subTotalCents"),
        "shippingCents": data.get("shippingCents"),
        "taxCents": data.get("taxCents"),
        "total": data.get("totalCostCents")
    }

    receipts.append(receipt)

    save_receipts(receipts)

    print(f"🧾 Receipt generated: {receipt['receiptId']}")

    dispatch(
        Events.ORDER_RECEIPT_GENERATED,
        receipt
    )
