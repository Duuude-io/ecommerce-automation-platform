def normalize_payload(payload: dict):
    payload = payload or {}

    user = {
        "userId": payload.get("userId") or payload.get("user_id"),
        "name": payload.get("name"),
        "email": payload.get("email"),
        "phone": payload.get("phone"),
    }

    # fallback safety
    user["userId"] = user["userId"] or "unknown"

    return {
        "user": user,
        "raw": payload
    }
