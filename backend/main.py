
from fastapi import FastAPI, Header
from fastapi.middleware.cors import CORSMiddleware

import json
import uuid
from pathlib import Path
from models.order import Order
from models.user import User, LoginRequest
from auth import verify_password, create_token, hash_password
from datetime import datetime
from auth import get_current_user

app = FastAPI()


BASE_DIR = Path(__file__).resolve().parent
USERS_FILE = BASE_DIR / "users.json"
ORDERS_FILE = BASE_DIR / "orders.json"

# Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500"],
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
