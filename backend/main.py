
from fastapi import FastAPI, Header, Depends, HTTPException, BackgroundTasks
from uuid import uuid4
from fastapi.middleware.cors import CORSMiddleware
import random
from random import randint
import time
from auth_states import AuthState
from utils.storage import load_users, save_users, load_receipts

import json
import uuid
from pathlib import Path
from models.order import Order
from models.user import User, LoginRequest, OTPRequest, VerifyOTPRequest, IdentifierRequest, SignupRequest, ChangePasswordRequest

from auth import verify_password, create_token, hash_password
from datetime import datetime, UTC
from auth import get_current_user
from automation.dispatcher import dispatch
from automation import handlers
from automation.events import Events
from contextlib import asynccontextmanager
from automation_db import init_db
from automation_db import get_conn


@asynccontextmanager
async def lifespan(app: FastAPI):
    # STARTUP
    init_db()
    print("🔥 Database initialized...")

    yield

    # SHUTDOWN (optional)
    print("...👋 App shutting down")


app = FastAPI(lifespan=lifespan)

signup_sessions = {}
pending_password_changes = {}

OTP_EXPIRY = 300  # 5 minutes
PASSWORD_CHANGE_EXPIRY = 600  # 10 minutes


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

OTP_FILE = BASE_DIR / "otp_store.json"


def load_otps():
    if not OTP_FILE.exists():
        return {}
    with OTP_FILE.open("r") as f:
        return json.load(f)


def save_otps(data):
    with OTP_FILE.open("w") as f:
        json.dump(data, f, indent=2)


def cleanup_expired_otps(otps):
    now = time.time()

    expired_keys = [
        key for key, value in otps.items()
        if now - value["created_at"] > OTP_EXPIRY
    ]

    for key in expired_keys:
        otps.pop(key, None)


def cleanup_expired_sessions():
    current_time = time.time()
    # 48 hours = 172,800 seconds
    expiry_limit = 172800

    #  list of keys to delete
    to_delete = [
        uid for uid, session in signup_sessions.items()
        if current_time - session.get("created_at", 0) > expiry_limit
    ]

    for uid in to_delete:
        del signup_sessions[uid]
        print(f"Purged expired session: {uid}")


def cleanup_expired_password_changes():
    now = time.time()

    expired = [
        user_id
        for user_id, request in pending_password_changes.items()
        if now - request["created_at"] > PASSWORD_CHANGE_EXPIRY
    ]

    for user_id in expired:
        pending_password_changes.pop(user_id, None)

    if expired:
        print(
            f"Cleaned up {len(expired)} expired password change requests"
        )


def generate_and_save_otp(user_id, identifier, purpose):
    otps = load_otps()
    cleanup_expired_otps(otps)

    key = f"{user_id}_{purpose}"
    otp = str(random.randint(100000, 999999))

    otps[key] = {
        "otp": otp,
        "purpose": purpose,
        "target": identifier,
        "created_at": time.time()
    }

    save_otps(otps)

    print(
        f"OTP DEBUG | user_id={user_id} | target={identifier} |purpose = {purpose} | otp={otp}")
    return otp


def is_identifier_taken(identifier: str, users, signup_sessions, exclude_user_id=None):
    identifier = normalize_identifier(identifier)

    # check existing users
    for u in users:
        if u["id"] == exclude_user_id:
            continue

        if (
            u.get("email") == identifier
            or u.get("phone") == identifier
            or u.get("pending_email") == identifier
            or u.get("pending_phone") == identifier
        ):
            return True

    # check pending sessions
    for sid, s in signup_sessions.items():
        if s.get("user_id") == exclude_user_id:
            continue

        if s.get("email") == identifier or s.get("phone") == identifier:
            return True

        # also check pending fields if you use them
        if s.get("pending_email") == identifier or s.get("pending_phone") == identifier:
            return True

    return False


def assert_identifier_available(identifier: str, user_id: str | None = None):

    identifier = normalize_identifier(identifier)

    users = load_users()

    if is_identifier_taken(
        identifier,
        users,
        signup_sessions,
        exclude_user_id=user_id
    ):
        raise ValueError("Identifier already in use")

    return identifier


@app.post("/signup")
def signup(data: SignupRequest):
    cleanup_expired_sessions()

    identifier = normalize_identifier(data.identifier)

    users = load_users()

    for sid, s in signup_sessions.items():
        if s.get("email") == identifier or s.get("phone") == identifier:

            # Fresh otpcode
            generate_and_save_otp(sid, identifier, "signup")

            return {
                "success": True,
                "resume": True,
                "message": "signup_in_progress",
                "userId": sid,  # their ID back
                "nextStep": s["auth_state"],  # where they were
                "authType": "email" if s.get("email") else "phone"
            }

    user_id = str(uuid4())

    purpose = "signup"
    auth_state = (
        "verify_signup_email"
        if "@" in identifier
        else "verify_signup_phone"
    )

    signup_sessions[user_id] = {
        "email": identifier if "@" in identifier else None,
        "phone": identifier if "@" not in identifier else None,
        "name": data.name,
        "password": hash_password(data.password),
        "auth_state": auth_state,
        "created_at": time.time()
    }

    generate_and_save_otp(user_id, identifier, purpose)

    return {
        "success": True,
        "userId": user_id,
        "nextStep": auth_state
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
        return {
            "success": False,
            "message": "Invalid password"
        }

    if not user.get("verified_email") and not user.get("verified_phone"):
        return {
            "error": "Complete verification before login",
            "next_page": user["auth_state"]
        }

    token = create_token(user["id"])

    dispatch(Events.USER_LOGGED_IN, {
        "userId": user["id"]
    })

    return {
        "success": True,
        "message": "Login successful",
        "token": token,
        "userId": user["id"],
        "userData": {
            "name": user.get("name"),
            "email": user.get("email"),
            "phone": user.get("phone"),
            "fullyVerified": (
                user["verified_email"]
                and user["verified_phone"]
            )
        },

        "next_page": user["auth_state"]
    }


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

    if user:
        return {
            "userExists": True,
            "userId": user["id"]
        }

    return {
        "userExists": False
    }


@app.post("/send-otp")
async def handle_send_otp(data: OTPRequest):

    user_id = data.userId
    purpose = data.purpose

    users = load_users()

    user = next((u for u in users if u["id"] == user_id), None)
    signup = signup_sessions.get(user_id)

    # SESSION VALIDATION
    if not user and not signup:
        return {"success": False, "message": "Invalid session"}

    if signup:
        if time.time() - signup["created_at"] > OTP_EXPIRY:
            signup_sessions.pop(user_id, None)
            return {"success": False, "message": "Signup session expired"}

    identifier = None

    # SIGNUP FLOW
    if purpose == "signup":
        if not signup:
            return {"success": False, "message": "Signup session missing"}

        identifier = (
            signup.get("email")
            or signup.get("phone")
        )

    # LOGIN FLOW
    elif purpose == "login":
        if not user:
            return {"success": False, "message": "User not found"}

        identifier = data.identifier

        if identifier not in [user.get("email"), user.get("phone")]:
            return {"success": False, "message": "Identifier not linked to user"}

        # SECURITY CHECK FOR LOGIN OTP
        if identifier not in [
            user.get("email"),
            user.get("phone")
        ]:
            return {"success": False, "message": "Identifier not linked to user"}

    # ADD EMAIL FLOW
    elif purpose == "add_email":
        if not user:
            return {"success": False, "message": "User not found"}

        if user.get("verified_email"):
            return {"success": False, "message": "Email already verified"}

        identifier = user.get("pending_email")

    # ADD PHONE FLOW
    elif purpose == "add_phone":
        if not user:
            return {"success": False, "message": "User not found"}

        if user.get("verified_phone"):
            return {"success": False, "message": "Phone already verified"}

        identifier = user.get("pending_phone")

    elif purpose == "change_password":
        if not user:
            return {"success": False, "message": "User not found"}

        identifier = (
            user.get("email") or user.get("phone")
        )

    else:
        return {"success": False, "message": "Invalid purpose"}

    # FINAL CHECK
    if not identifier:
        return {"success": False, "message": "No pending identifier"}

    generate_and_save_otp(user_id, identifier, purpose)

    print(
        "SEND OTP DEBUG:",
        "user_id:", user_id,
        "identifier:", identifier,
        "purpose:", purpose
    )

    return {
        "success": True,
        "message": "OTP generated"
    }


@app.post("/verify-otp")
def verify_otp(data: VerifyOTPRequest):

    otps = load_otps()

    user_id = data.userId
    otp = data.otp.strip()

    key = f"{user_id}_{data.purpose}"

    print("KEY EXPECTED:", key)
    print("OTP STORE KEYS:", otps.keys())

    stored = otps.get(key)

    if not stored:
        return {"success": False, "message": "OTP not found"}

    if stored["otp"] != otp:
        return {"success": False, "message": "Invalid OTP"}

    if time.time() - stored["created_at"] > OTP_EXPIRY:
        otps.pop(key, None)
        save_otps(otps)

        return {"success": False, "message": "OTP expired"}

    purpose = stored.get("purpose")

    if purpose != data.purpose:
        return {"success": False, "message": "OTP purpose mismatch"}

    # consume OTP once verified
    otps.pop(key, None)
    save_otps(otps)
    target = stored.get("target")

    users = load_users()

    # SIGNUP FLOW
    if purpose == "signup":

        signup = signup_sessions.get(user_id)

        if not signup:
            return {"success": False, "message": "Session expired, login instead"}

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

        if any(u["id"] == user_id for u in users):
            return {"success": False, "message": "Duplicate user id"}

        existing_user = next((u for u in users if u["id"] == user_id), None)

        if not existing_user:
            users.append(new_user)
            save_users(users)

            dispatch(Events.USER_CREATED, {
                "userId": user_id,
                "email": signup.get("email"),
                "phone": signup.get("phone"),
                "name": signup.get("name")
            })

        signup_sessions.pop(user_id, None)

        token = create_token(user_id)

        fully_verified = new_user["verified_email"] and new_user["verified_phone"]

        if fully_verified:
            dispatch(Events.OTP_VERIFIED, {
                "userId": user_id,
                "name": user.get("name"),
                "email": new_user.get("email"),
                "phone": new_user.get("phone")
            })

        return {
            "success": True,
            "token": token,
            "userId": user_id,
            "fullyVerified": fully_verified,
            "userData": {
                "name": new_user["name"],
                "email": new_user["email"],
                "phone": new_user["phone"],
                "fullyVerified": fully_verified
            },
            "next_step": new_user["auth_state"],
            "next_page": "accverified.html" if fully_verified else "accsuccess.html"
        }

    # ADD EMAIL / PHONE FLOW / PASSWORD CHANGE
    user = next((u for u in users if u["id"] == user_id), None)

    if not user:
        return {"success": False, "message": "User not found"}

    if purpose == "change_password":

        cleanup_expired_password_changes()

        pending = pending_password_changes.get(user_id)

        if not pending:
            return {
                "success": False,
                "message": "Password change session expired"
            }

        if (
            time.time() - pending["created_at"] > OTP_EXPIRY
        ):
            pending_password_changes.pop(user_id, None)

            otps.pop(key, None)
            save_otps(otps)

            return {
                "success": False,
                "message": "Password change request expired"
            }

        user["password"] = pending["new_password"]
        save_users(users)
        pending_password_changes.pop(user_id, None)

        return {
            "success": True,
            "message": "Password updated successfully"
        }

    if purpose == "add_email":
        pending_email = user.get("pending_email")

        if not pending_email:
            return {"success": False, "message": "No pending email"}

        try:
            assert_identifier_available(pending_email, user_id)
        except ValueError:
            return {"success": False, "message": "Email already used"}

        user["email"] = pending_email
        user["verified_email"] = True
        user.pop("pending_email", None)

    if purpose == "add_phone":
        pending_phone = user.get("pending_phone")

        if not pending_phone:
            return {"success": False, "message": "No pending phone"}

        try:
            assert_identifier_available(pending_phone, user_id)
        except ValueError:
            return {"success": False, "message": "Phone already used"}

        user["phone"] = pending_phone
        user["verified_phone"] = True
        user.pop("pending_phone", None)

    if user["verified_email"] and user["verified_phone"]:
        user["auth_state"] = AuthState.AUTHENTICATED.value
    elif user["verified_email"]:
        user["auth_state"] = AuthState.ADD_PHONE_OPTIONAL.value
    elif user["verified_phone"]:
        user["auth_state"] = AuthState.ADD_EMAIL_OPTIONAL.value

    save_users(users)
    otps.pop(key, None)
    save_otps(otps)

    if user["verified_email"] and user["verified_phone"]:
        dispatch(Events.USER_FULLY_VERIFIED, {
            "userId": user["id"],
            "name": user.get("name"),
            "email": user.get("email"),
            "phone": user.get("phone")
        })

    return {
        "success": True,
        "token": create_token(user_id),
        "userId": user_id,
        "fullyVerified": user["verified_email"] and user["verified_phone"],
        "userData": {
            "name": user.get("name"),
            "email": user.get("email"),
            "phone": user.get("phone"),
            "fullyVerified": user["verified_email"] and user["verified_phone"]
        },
        "next_step": user["auth_state"],
        "next_page": "accverified.html" if user["verified_email"] and user["verified_phone"] else "accsuccess.html"
    }


@app.post("/verify-login-otp")
def verify_login_otp(data: VerifyOTPRequest):

    user_id = data.userId
    otp = data.otp.strip()

    key = f"{user_id}_{data.purpose}"

    otps = load_otps()
    stored = otps.get(key)

    if not stored or stored["otp"] != otp:
        return {"success": False, "message": "Invalid OTP"}

    if time.time() - stored["created_at"] > OTP_EXPIRY:
        otps.pop(key, None)
        save_otps(otps)
        return {"success": False, "message": "OTP expired"}

    users = load_users()

    user = next((u for u in users if u["id"] == user_id), None)

    if not user:
        return {"success": False, "message": "User not found"}

    otps.pop(key, None)
    save_otps(otps)

    dispatch(Events.USER_LOGGED_IN, {
        "userId": user_id
    })

    return {
        "success": True,
        "token": create_token(user_id),
        "userId": user_id,
        "userData": {
            "name": user.get("name"),
            "email": user.get("email"),
            "phone": user.get("phone"),
            "fullyVerified": (
                user["verified_email"]
                and user["verified_phone"]
            )
        },
        "verifiedEmail": user["verified_email"],
        "verifiedPhone": user["verified_phone"],
        "next_page": "accsuccess.html"
    }


def safe_json_load(value):
    try:
        return json.loads(value) if value else {}
    except:
        return {}


@app.get("/automation/logs")
def get_automation_logs():
    conn = get_conn()
    cur = conn.cursor()

    cur.execute("""
        SELECT
            event,
            handler,
            user_id,
            payload,
            status,
            timestamp,
            user_name,
            email,
            phone
        FROM automation_logs
        ORDER BY timestamp DESC
    """)

    rows = cur.fetchall()
    conn.close()

    return [
        (
            lambda payload: {
                "event": r[0],
                "handler": r[1],
                "user_id": r[2],
                "payload": payload,
                "status": r[4],
                "timestamp": r[5],
                "name": r[6],
                "email": r[7],
                "phone": r[8]
            }
        )(safe_json_load(r[3]))
        for r in rows
    ]


@app.get("/auth/session-status")
def session_status(current_user=Depends(get_current_user)):

    users = load_users()

    user = next((u for u in users if u["id"] == current_user["id"]), None)

    if not user:
        return {"next_page": "login.html"}

    return {
        "next_page": {
            "CREATE_ACCOUNT": "createaccount.html",
            "VERIFY_EMAIL": "emailverify.html",
            "VERIFY_PHONE": "numberverify.html",
            "ADD_EMAIL_OPTIONAL": "addemail.html",
            "ADD_PHONE_OPTIONAL": "addnumber.html",
            "AUTHENTICATED": "accsuccess.html"
        }.get(user.get("auth_state", "CREATE_ACCOUNT"), "login.html")
    }


@app.post("/add-phone")
def add_phone(data: dict, current_user: dict = Depends(get_current_user)):

    phone = normalize_identifier(data["phone"])
    users = load_users()

    # prevent duplicate phone

    try:
        phone = assert_identifier_available(
            phone,
            current_user["id"]
        )
    except ValueError as e:
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
    try:
        email = assert_identifier_available(
            data["email"],
            current_user["id"]
        )
    except ValueError as e:
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


def generate_order_number():
    return (
        f"{randint(100, 999)}-"
        f"{randint(1000000, 9999999)}-"
        f"{randint(1000000, 9999999)}"
    )


@app.post("/orders")
def create_order(order: Order, background_tasks: BackgroundTasks, current_user=Depends(get_current_user)):

    user_id = current_user["id"]

    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    verified_email = current_user.get("verified_email", False)
    verified_phone = current_user.get("verified_phone", False)

    if not verified_email or not verified_phone:
        raise HTTPException(
            status_code=403,
            detail="User must verify phone and email before ordering"
        )

    orders = load_orders()

    new_order = order.model_dump()
    new_order["id"] = str(uuid.uuid4())
    new_order["userId"] = user_id

    new_order["orderNumber"] = generate_order_number()
    new_order["orderTime"] = datetime.now(UTC).isoformat()

    new_order["subTotalCents"] = order.subTotalCents
    new_order["taxCents"] = order.taxCents
    new_order["shippingCents"] = order.shippingCents
    new_order["totalCostCents"] = order.totalCostCents

    orders.append(new_order)

    print("NEW ORDER:", new_order)

    save_orders(orders)

    background_tasks.add_task(
        dispatch,
        Events.ORDER_CREATED,
        {
            "orderId": new_order["id"],
            "userId": user_id,

            "name": current_user.get("name"),
            "email": current_user.get("email"),
            "phone": current_user.get("phone"),

            "orderNumber": new_order["orderNumber"],
            "subTotalCents": new_order["subTotalCents"],
            "taxCents": new_order["taxCents"],
            "shippingCents": new_order["shippingCents"],
            "totalCostCents": new_order["totalCostCents"],

            "items": new_order["items"],
            "billingDetails": new_order["billingDetails"],
            "orderTime": new_order["orderTime"]
        })

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
def cancel_order(order_id: str, current_user=Depends(get_current_user)):

    orders = load_orders()

    updated_orders = [
        order for order in orders
        if not (
            order["id"] == order_id
            and order["userId"] == current_user["id"]
        )
    ]

    save_orders(updated_orders)

    dispatch(Events.ORDER_CANCELLED, {
        "orderId": order_id,
        "userId": current_user["id"],
        "cancelledAt": datetime.now(UTC).isoformat()
    })

    return {"message": "Order cancelled successfully"}


@app.get("/orders/{order_id}/receipt")
def get_order_receipt(
    order_id: str,
    current_user=Depends(get_current_user)
):

    receipts = load_receipts()

    receipt = next(
        (
            r for r in receipts
            if r["orderId"] == order_id
            and r["userId"] == current_user["id"]
        ),
        None
    )

    if not receipt:
        raise HTTPException(
            status_code=404,
            detail="Receipt not found"
        )

    return receipt


@app.post("/request-password-change")
def request_password_change(
    data: ChangePasswordRequest,
    current_user=Depends(get_current_user)
):

    users = load_users()
    user = next((
        u for u in users
        if u["id"] == current_user["id"]), None
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if not verify_password(
        data.currentPassword,
        user["password"]
    ):
        return {
            "success": False,
            "message": "Current password incorrect"
        }

    if data.currentPassword == data.newPassword:
        return {
            "success": False,
            "message": "New password must be different"
        }

    cleanup_expired_password_changes()

    pending_password_changes[user["id"]] = {
        "new_password": hash_password(data.newPassword),
        "created_at": time.time()
    }

    if data.otpMethod == "email":
        identifier = user.get("email")
    else:
        identifier = user.get("phone")

    if not identifier:
        return {
            "success": False,
            "message": "No verified identifier found"
        }

    print("REQUEST PASSWORD CHANGE ENDPOINT")

    generate_and_save_otp(
        user["id"],
        identifier,
        "change_password"
    )

    return {
        "success": True,
        "message": "OTP sent"
    }
