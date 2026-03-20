from pydantic import BaseModel
from datetime import datetime


class TransportCreate(BaseModel):
    pet_id: int
    pickup_address: str
    delivery_address: str
    transport_type: str = "express"
    pet_weight: float = 0
    contact_phone: str = ""
    remark: str = ""


class Transport(BaseModel):
    id: int
    user_id: int
    pet_id: int
    pet_name: str
    pickup_address: str
    delivery_address: str
    transport_type: str
    pet_weight: float
    price: float
    status: str
    contact_phone: str
    remark: str
    created_at: datetime

    class Config:
        from_attributes = True


class FosterCreate(BaseModel):
    pet_id: int
    start_date: datetime
    end_date: datetime
    daily_price: float
    service_type: str = "daycare"
    contact_phone: str = ""
    address: str = ""
    remark: str = ""


class Foster(BaseModel):
    id: int
    user_id: int
    pet_id: int
    pet_name: str
    start_date: datetime
    end_date: datetime
    daily_price: float
    total_price: float
    status: str
    service_type: str
    contact_phone: str
    address: str
    remark: str
    created_at: datetime

    class Config:
        from_attributes = True
