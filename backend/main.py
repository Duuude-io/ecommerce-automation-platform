
from uuid import uuid4
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
from models.user import User, LoginRequest, OTPRequest, VerifyOTPRequest, IdentifierRequest, SignupRequest
from auth import verify_password, create_token, hash_password
from datetime import datetime
from auth import get_current_user

app = FastAPI()

otp_store = {}

signup_sessions = {}

OTP_EXPIRY = 300  # 5 minutes


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
def signup(data: SignupRequest):

    identifier = normalize_identifier(data.identifier)

    users = load_users()

    # block existing users
    for u in users:
        if u["email"] == identifier or u["phone"] == identifier:
            return {"success": False, "message": "User already exists"}

    # detect type
    auth_type = "email" if "@" in identifier else "phone"

    signup_sessions[identifier] = {
        "id": str(uuid4()),
        "name": data.name,
        "password": hash_password(data.password),
        "auth_type": auth_type
    }

    return {"success": True}


@app.post("/login")
def login(data: LoginRequest):

    identifier = normalize_identifier(data.identifier)
    users = load_users()

    user = next(
        (
            u for u in users
            if u["email"] == identifier
            or u["phone"] == identifier
        ),
        None
    )

    if not user:
        return {"error": "User not found"}

    #  block unverified users
    if (
        ("@" in identifier and not user["verified_email"])
        or ("@" not in identifier and not user["verified_phone"])
    ):
        return {"error": "Verify your account first"}

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


def normalize_identifier(identifier: str):
    return identifier.strip().lower()


@app.post("/check-user")
def check_user(data: IdentifierRequest):

    identifier = normalize_identifier(data.identifier)
    users = load_users()

    user = next(
        (
            u for u in users
            if u.get("email") == identifier
            or u.get("phone") == identifier
        ),
        None
    )

    return {
        "userExists": user is not None
    }


@app.post("/send-otp")
async def send_otp(data: OTPRequest):

    identifier = normalize_identifier(data.identifier)
    purpose = data.purpose

    otp = str(random.randint(100000, 999999))

    otp_store[identifier] = {
        "otp": otp,
        "created_at": time.time(),
        "purpose": purpose
    }

    # console output only
    print(f" OTP for {identifier} ({purpose}): {otp}")

    return {
        "success": True,
        "message": "OTP generated"}


def normalize_identifier(identifier: str):
    return identifier.strip().lower()


@app.post("/verify-otp")
def verify_otp(data: VerifyOTPRequest):

    identifier = normalize_identifier(data.identifier)
    otp = data.otp.strip()

    stored = otp_store.get(identifier)

    if not stored or stored["otp"] != otp:
        return {"success": False, "message": "Invalid OTP"}

    purpose = stored.get("purpose")

    users = load_users()

    # CASE 1: SIGNUP (CREATE USER)

    if purpose == "signup":

        signup = signup_sessions.get(identifier)

        if not signup:
            return {"success": False, "message": "Signup session expired"}

        new_user = {
            "id": signup["id"],
            "email": identifier if signup["auth_type"] == "email" else "",
            "phone": identifier if signup["auth_type"] == "phone" else "",
            "password": signup["password"],
            "name": signup["name"],
            "verified_email": signup["auth_type"] == "email",
            "verified_phone": signup["auth_type"] == "phone"
        }

        users.append(new_user)
        save_users(users)

        del signup_sessions[identifier]
        del otp_store[identifier]

        token = create_token(new_user["id"])

        return {
            "success": True,
            "token": token,
            "nextStep":
                "add_phone" if not new_user["verified_phone"] else
                "add_email" if not new_user["verified_email"] else
                "done"
        }

    # CASE 2: ADD EMAIL / PHONE VERIFICATION

    user = next(
        (u for u in users if u["email"] ==
         identifier or u["phone"] == identifier),
        None
    )

    if not user:
        return {"success": False, "message": "User not found"}

    if purpose == "add_email":
        user["email"] = identifier
        user["verified_email"] = True

    elif purpose == "add_phone":
        user["phone"] = identifier
        user["verified_phone"] = True

    save_users(users)
    del otp_store[identifier]

    token = create_token(user["id"])

    return {
        "success": True,
        "token": token,
        "fullyVerified": user["verified_email"] and user["verified_phone"]
    }


@app.post("/verify-login-otp")
def verify_login_otp(data: VerifyOTPRequest):

    identifier = normalize_identifier(data.identifier)

    stored = otp_store.get(identifier)

    if not stored or stored["otp"] != data.otp.strip():
        return {"success": False, "message": "Invalid OTP"}

    users = load_users()

    for user in users:
        if user["email"] == identifier or user["phone"] == identifier:

            token = create_token(user["id"])

            del otp_store[identifier]

            return {
                "success": True,
                "token": token
            }

    return {"success": False, "message": "User not found"}


@app.post("/add-phone")
def add_phone(data: dict):

    identifier = normalize_identifier(data["identifier"])
    phone = normalize_identifier(data["phone"])

    users = load_users()

    for u in users:
        if u.get("phone") == phone:
            return {
                "error": "Phone already used by another account"
            }

    user = next(
        (
            u for u in users
            if u["email"] == identifier
            or u["phone"] == identifier
        ),
        None
    )

    if not user:
        return {"error": "User not found"}

    user["phone"] = phone
    save_users(users)

    return {"message": "Phone added"}


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
