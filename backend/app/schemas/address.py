from pydantic import BaseModel
from datetime import datetime


class AddressCreate(BaseModel):
    name: str
    phone: str
    province: str = ""
    city: str = ""
    district: str = ""
    detail: str = ""
    is_default: bool = False


class Address(BaseModel):
    id: int
    user_id: int
    name: str
    phone: str
    province: str
    city: str
    district: str
    detail: str
    is_default: int
    created_at: datetime

    class Config:
        from_attributes = True
