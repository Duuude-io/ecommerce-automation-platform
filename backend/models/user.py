from pydantic import BaseModel, EmailStr
from uuid import UUID
from auth_states import AuthState


class User(BaseModel):
    id: str
    email: EmailStr | None = None
    phone: str | None = None
    password: str
    verified_email: bool = False
    verified_phone: bool = False
    name: str | None = None
    auth_state: AuthState = AuthState.CREATE_ACCOUNT


class LoginRequest(BaseModel):
    identifier: str   # email OR phone
    password: str


class OTPRequest(BaseModel):
    userId: str
    identifier: str   # email OR phone
    purpose: str


class VerifyOTPRequest(BaseModel):
    userId: str
    otp: str
    purpose: str


class IdentifierRequest(BaseModel):
    identifier: str


class SignupRequest(BaseModel):
    identifier: str
    name: str
    password: str


class ChangePasswordRequest(BaseModel):
    currentPassword: str
    newPassword: str
    otpMethod: str
