import httpx


# ===== TERMII CONFIG =====
TERMII_API_KEY = "TLRWBKOKpqzbWtSTUDpMICvZzoXpIbYZvhQfJYIMLTatMqPPpymTAluWnIBKej"
BASE_URL = "https://v3.api.termii.com"


# ===== FORMAT NIGERIAN NUMBER =====
def normalize_phone(phone: str):

    phone = phone.strip()

    # 08012345678 → +2348012345678
    if phone.startswith("0"):
        return "+234" + phone[1:]

    # 2348012345678 → +2348012345678
    if phone.startswith("234"):
        return "+" + phone

    return phone


# ===== SEND OTP SMS =====
async def send_sms_otp(phone: str, otp: str):

    phone = normalize_phone(phone)

    url = f"{BASE_URL}/api/sms/send"

    payload = {
        "to": phone,
        "from": "Notify",  # default sender (works immediately)
        "sms": f"Your Amazon OTP code is {otp}",
        "type": "plain",
        "channel": "generic",
        "api_key": TERMII_API_KEY
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload)

        try:
            data = response.json()
        except:
            data = {"raw": response.text}

        if response.status_code == 200:
            print("✅ SMS SENT:", data)
        else:
            print("❌ SMS FAILED:", data)

        return data

    except Exception as e:
        print("❌ SMS ERROR:", e)
        return {"error": str(e)}
