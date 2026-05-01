from pydantic import BaseModel, EmailStr
from uuid import UUID


class User(BaseModel):
    id: UUID
    email: EmailStr
    phone: str
    password: str
    verified_email: bool = False
    verified_phone: bool = False
    name: str | None = None


class LoginRequest(BaseModel):
    identifier: str   # email OR phone
    password: str


class OTPRequest(BaseModel):
    identifier: str   # email OR phone


class VerifyOTPRequest(BaseModel):
    identifier: str
    otp: str
