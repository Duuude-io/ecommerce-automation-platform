from pydantic import BaseModel, EmailStr
from uuid import UUID


class User(BaseModel):
    id: UUID
    email: EmailStr | None = None
    phone: str | None = None
    password: str
    verified_email: bool = False
    verified_phone: bool = False
    name: str | None = None


class LoginRequest(BaseModel):
    identifier: str   # email OR phone
    password: str


class OTPRequest(BaseModel):
    identifier: str   # email OR phone
    purpose: str


class VerifyOTPRequest(BaseModel):
    identifier: str
    otp: str


class IdentifierRequest(BaseModel):
    identifier: str


class SignupRequest(BaseModel):
    identifier: str
    name: str
    password: str
