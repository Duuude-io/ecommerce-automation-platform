
from fastapi import FastAPI, Header
from fastapi.middleware.cors import CORSMiddleware
import random
from sms_service import send_sms_otp
from email_service import send_email_otp
import time

import json
import uuid
from pathlib import Path
from models.order import Order
from models.user import User, LoginRequest, IdentifierRequest
from auth import verify_password, create_token, hash_password
from datetime import datetime
from auth import get_current_user

app = FastAPI()

otp_store = {}


BASE_DIR = Path(__file__).resolve().parent
USERS_FILE = BASE_DIR / "users.json"
ORDERS_FILE = BASE_DIR / "orders.json"

# Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/signup")
def signup(user: User):

    users = load_users()  # load existing users

    new_user = {
        "id": str(uuid.uuid4()),
        "email": user.email,
        "password": hash_password(user.password)
    }

    users.append(new_user)

    save_users(users)  # save users to file

    return {"message": "User created"}


@app.post("/login")
def login(data: LoginRequest):

    users = load_users()

    user = next((u for u in users if u["email"] == data.email), None)

    if not user:
        return {"error": "User not found"}

    if not verify_password(data.password, user["password"]):
        return {"error": "Invalid password"}

    token = create_token(user["id"])

    return {
        "message": "Login successful",
        "token": token,
        "userId": user["id"]
    }


def load_users():
    if not USERS_FILE.exists():
        return []
    with USERS_FILE.open("r") as file:
        return json.load(file)


def save_users(users):
    with USERS_FILE.open("w") as file:
        json.dump(users, file, indent=2)


@app.post("/check-user")
def check_user(data: IdentifierRequest):

    users = load_users()

    # check BOTH email or phone
    user = next(
        (
            u for u in users
            if u.get("email") == data.identifier
            or u.get("phone") == data.identifier
        ),
        None
    )

    return {
        "userExists": True if user else False
    }


@app.post("/send-otp")
async def send_otp(data: IdentifierRequest):

    identifier = data.identifier
    otp = str(random.randint(100000, 999999))

    otp_store[identifier] = {
        "otp": otp,
        "created_at": time.time()
    }

    # DEV MODE: console output only
    print(f"🔥 OTP for {identifier}: {otp}")

    return {"message": "OTP generated (check server console)"}


@app.post("/verify-otp")
def verify_otp(data: dict):

    identifier = data["identifier"]
    otp = data["otp"]

    if otp_store.get(identifier) != otp:
        return {"success": False}

    # OTP is correct → now issue JWT like normal login
    users = load_users()

    user = next(
        (u for u in users if u["email"] ==
         identifier or u["phone"] == identifier),
        None
    )

    if not user:
        return {"success": False}

    token = create_token(user["id"])

    return {
        "success": True,
        "token": token,
        "userId": user["id"]
    }


@app.get("/")
def root():
    return {"message": "Amazon Backend API is running"}


with open("products.json") as f:
    PRODUCTS = json.load(f)


@app.get("/products")
def get_products():
    return PRODUCTS


BASE_DIR = Path(__file__).resolve().parent
ORDERS_FILE = BASE_DIR / "orders.json"


def load_orders():
    if not ORDERS_FILE.exists():
        return []

    with ORDERS_FILE.open("r") as file:
        return json.load(file)


def save_orders(orders):
    with ORDERS_FILE.open("w") as file:
        json.dump(orders, file, indent=2)


@app.post("/orders")
def create_order(order: Order, authorization: str = Header(None)):

    if not authorization:
        return {"error": "Unauthorized"}

    token = authorization.replace("Bearer ", "")
    user_id = get_current_user(token)

    if not user_id:
        return {"error": "Unauthorized"}

    orders = load_orders()

    new_order = order.model_dump()
    new_order["id"] = str(uuid.uuid4())
    new_order["userId"] = user_id
    new_order["orderTime"] = datetime.utcnow().isoformat()

    orders.append(new_order)
    save_orders(orders)

    return {
        "message": "Order created successfully!",
        "orderId": new_order["id"]
    }


@app.get("/orders")
def get_orders():
    return load_orders()


@app.delete("/orders/{order_id}")
def cancel_order(order_id: str):

    orders = load_orders()

    updated_orders = [
        order for order in orders
        if order["id"] != order_id
    ]

    save_orders(updated_orders)

    return {"message": "Order cancelled successfully"}


# auth flow >>>>
