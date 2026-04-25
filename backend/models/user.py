from pydantic import BaseModel


class User(BaseModel):
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str
