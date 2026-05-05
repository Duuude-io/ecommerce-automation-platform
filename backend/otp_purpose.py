from enum import Enum


class OTPPurpose(str, Enum):
    SIGNUP = "signup"
    LOGIN = "login"
    ADD_EMAIL = "add_email"
    ADD_PHONE = "add_phone"
