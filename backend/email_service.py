async def send_email_otp(email: str, otp: str):
    print("📧 DEV EMAIL SENT")
    print(f"Email: {email}")
    print(f"OTP: {otp}")

    return {
        "status": "success",
        "message": "DEV EMAIL OTP generated",
        "otp": otp
    }
