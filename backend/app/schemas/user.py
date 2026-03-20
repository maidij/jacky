from pydantic import BaseModel
from datetime import datetime


class UserCreate(BaseModel):
    username: str
    password: str
    role: str = "user"
    email: str = ""
    phone: str = ""


class UserUpdate(BaseModel):
    email: str | None = None
    phone: str | None = None


class User(BaseModel):
    id: int
    username: str
    role: str
    email: str
    phone: str
    created_at: datetime

    class Config:
        from_attributes = True
