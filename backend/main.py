
from uuid import uuid4
from fastapi import FastAPI, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
import random
from sms_service import send_sms_otp
from email_service import send_email_otp
import time
from auth_states import AuthState

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

    user_id = str(uuid4())

    identifier = normalize_identifier(data.identifier)

    users = load_users()

    # block existing users
    for u in users:
        if u["email"] == identifier or u["phone"] == identifier:
            return {"success": False, "message": "User already exists"}

    for s in signup_sessions.values():
        if s.get("email") == identifier or s.get("phone") == identifier:
            return {"success": False, "message": "Signup already in progress"}

    signup_sessions[user_id] = {
        "email": identifier if "@" in identifier else None,
        "phone": identifier if "@" not in identifier else None,
        "name": data.name,
        "password": hash_password(data.password),
        "auth_state": (
            AuthState.VERIFY_EMAIL.value
            if "@" in identifier
            else AuthState.VERIFY_PHONE.value
        ),
        "created_at": time.time()
    }

    return {
        "success": True,
        "userId": user_id
    }


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

    if not verify_password(data.password, user["password"]):
        return {"error": "Invalid password"}

    token = create_token(user["id"])

    return {
        "message": "Login successful",
        "token": token,
        "userId": user["id"],
        "next_step": user["auth_state"]
    }


def load_users():
    if not USERS_FILE.exists():
        return []

    with USERS_FILE.open("r") as file:
        users = json.load(file)

    # BACKWARD COMPATIBILITY FIX
    for user in users:
        user.setdefault("auth_state", AuthState.CREATE_ACCOUNT.value)

    return users


def save_users(users):
    with USERS_FILE.open("w") as file:
        json.dump(users, file, indent=2)


def normalize_identifier(identifier: str):
    identifier = identifier.strip()

    if "@" in identifier:
        return identifier.lower()

    return identifier


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

    user_id = data.userId
    identifier = normalize_identifier(data.identifier)

    user = next((u for u in load_users() if u["id"] == user_id), None)
    signup = signup_sessions.get(user_id)

    if not user and not signup:
        return {"error": "Invalid session"}

    if signup:
        if time.time() - signup["created_at"] > OTP_EXPIRY:
            signup_sessions.pop(user_id, None)
            return {"error": "Signup session expired"}

    if user:
        if data.purpose == "add_email" and user["verified_email"]:
            return {"error": "Email already verified"}

        if data.purpose == "add_phone" and user["verified_phone"]:
            return {"error": "Phone already verified"}

    key = f"{user_id}_{data.purpose}"

    otp_store.pop(key, None)

    otp = str(random.randint(100000, 999999))

    otp_store[key] = {
        "otp": otp,
        "purpose": data.purpose,
        "target": identifier,
        "created_at": time.time()
    }

    # console output only
    print(f"OTP DEBUG | user_id={user_id} | target={identifier} | otp={otp}")

    print("OTP STORE:", otp_store)
    print("VERIFY REQUEST USER_ID:", user_id)

    return {
        "success": True,
        "message": "OTP generated"}


@app.post("/verify-otp")
def verify_otp(data: VerifyOTPRequest):

    user_id = data.userId
    otp = data.otp.strip()

    key = f"{user_id}_{data.purpose}"
    stored = otp_store.get(key)

    if not stored:
        return {"success": False, "message": "OTP not found"}

    if stored["otp"] != otp:
        return {"success": False, "message": "Invalid OTP"}

    if time.time() - stored["created_at"] > OTP_EXPIRY:
        del otp_store[key]

        return {"success": False, "message": "OTP expired"}

    purpose = stored.get("purpose")

    if purpose != data.purpose:
        return {"success": False, "message": "OTP purpose mismatch"}
    target = stored.get("target")

    users = load_users()

    # SIGNUP FLOW
    if purpose == "signup":

        signup = signup_sessions.get(user_id)

        if not signup:
            return {"success": False, "message": "Session expired"}

        signup["auth_state"] = (
            AuthState.ADD_PHONE_OPTIONAL.value
            if signup["email"]
            else AuthState.ADD_EMAIL_OPTIONAL.value
        )

        new_user = {
            "id": user_id,
            "email": signup["email"],
            "phone": signup["phone"],
            "password": signup["password"],
            "name": signup["name"],
            "verified_email": signup["email"] is not None,
            "verified_phone": signup["phone"] is not None,
            "auth_state": signup["auth_state"]
        }

        users.append(new_user)
        save_users(users)

        signup_sessions.pop(user_id, None)

        del otp_store[key]

        token = create_token(user_id)

        return {
            "success": True,
            "token": token,
            "userId": user_id,
            "fullyVerified": new_user["verified_email"] and new_user["verified_phone"],
            "next_step": new_user["auth_state"]
        }

    # ADD EMAIL / PHONE FLOW
    user = next((u for u in users if u["id"] == user_id), None)

    if not user:
        return {"success": False, "message": "User not found"}

    if purpose == "add_email":
        user["email"] = user.pop("pending_email", None)
        user["verified_email"] = True
    if "pending_phone" not in user:
        return {"success": False, "message": "No pending phone"}

    if user["verified_email"] and user["verified_phone"]:
        user["auth_state"] = AuthState.AUTHENTICATED.value
    elif user["verified_email"]:
        user["auth_state"] = AuthState.ADD_PHONE_OPTIONAL.value
    elif user["verified_phone"]:
        user["auth_state"] = AuthState.ADD_EMAIL_OPTIONAL.value

    save_users(users)
    del otp_store[key]

    return {
        "success": True,
        "fullyVerified": user["verified_email"] and user["verified_phone"],
        "next_step": user["auth_state"]
    }


@app.post("/verify-login-otp")
def verify_login_otp(data: VerifyOTPRequest):

    user_id = data.userId
    otp = data.otp.strip()

    key = f"{user_id}_{data.purpose}"
    stored = otp_store.get(key)

    if not stored or stored["otp"] != otp:
        return {"success": False, "message": "Invalid OTP"}

    if time.time() - stored["created_at"] > OTP_EXPIRY:
        otp_store.pop(key, None)
        return {"success": False, "message": "OTP expired"}

    users = load_users()

    user = next((u for u in users if u["id"] == user_id), None)

    if not user:
        return {"success": False, "message": "User not found"}

    del otp_store[key]

    return {
        "success": True,
        "token": create_token(user_id),
        "userId": user_id,
        "verifiedEmail": user["verified_email"],
        "verifiedPhone": user["verified_phone"]
    }


@app.get("/auth/session-status")
def session_status(current_user=Depends(get_current_user)):

    users = load_users()

    user = next(
        (u for u in users if u["id"] == current_user["id"]),
        None
    )

    if not user:
        return {"next_step": "LOGIN"}

    return {
        "next_step": user.get("auth_state", "LOGIN")
    }


@app.post("/add-phone")
def add_phone(data: dict, current_user: dict = Depends(get_current_user)):

    phone = normalize_identifier(data["phone"])
    users = load_users()

    # prevent duplicate phone
    for u in users:
        if u.get("phone") == phone:
            return {"error": "Phone already used"}

    user = next((u for u in users if u["id"] == current_user["id"]), None)

    if not user:
        return {"error": "User not found"}
    user["pending_phone"] = phone
    user["auth_state"] = AuthState.VERIFY_PHONE.value

    save_users(users)

    return {
        "success": True,
        "userId": current_user["id"],
        "token": create_token(user["id"]),
        "next_step": user["auth_state"],
        "fullyVerified": user["verified_email"] and user["verified_phone"]
    }


@app.post("/add-email")
def add_email(data: dict, current_user: dict = Depends(get_current_user)):

    email = normalize_identifier(data["email"])
    users = load_users()

    # prevent duplicate email
    for u in users:
        if u.get("email") == email:
            return {"error": "Email already used"}

    user = next((u for u in users if u["id"] == current_user["id"]), None)

    if not user:
        return {"error": "User not found"}

    user["pending_email"] = email
    user["auth_state"] = AuthState.VERIFY_EMAIL.value

    save_users(users)

    return {
        "success": True,
        "userId": user["id"],
        "token": create_token(user["id"]),
        "next_step": user["auth_state"],
        "fullyVerified": user["verified_email"] and user["verified_phone"]
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
def create_order(order: Order, current_user=Depends(get_current_user)):

    user_id = current_user["id"]

    if not user_id:
        return {"error": "Unauthorized"}

    if not current_user["verified_email"] or not current_user["verified_phone"]:
        return {"error": "Complete verification before ordering"}

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
def get_orders(current_user=Depends(get_current_user)):
    orders = load_orders()

    return [
        o for o in orders
        if o["userId"] == current_user["id"]
    ]


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
