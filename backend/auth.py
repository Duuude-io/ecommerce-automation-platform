from passlib.context import CryptContext
from jose import jwt, JWTError
import datetime
from fastapi import Header, HTTPException
from utils.storage import load_users, load_sessions
from uuid import uuid4

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = "secret123"
ALGORITHM = "HS256"


def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def create_token(user_id, session_id):
    payload = {
        "user_id": user_id,
        "session_id": session_id,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=1)
    }

    token = jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )
    return token, session_id


def get_current_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing token")

    token = authorization.replace("Bearer ", "")

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        user_id = payload["user_id"]
        session_id = payload["session_id"]

        sessions = load_sessions()
        user_sessions = sessions.get(user_id, [])

        session_exists = any(
            s["id"] == session_id
            for s in user_sessions
        )

        if not session_exists:
            raise HTTPException(
                status_code=401,
                detail="Session revoked"
            )

        users = load_users()
        user = next((u for u in users if u["id"] == user_id), None)

        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        return user   # RETURN FULL USER OBJECT

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
