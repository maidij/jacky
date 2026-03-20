from pydantic import BaseModel
from datetime import datetime


class AppointmentCreate(BaseModel):
    pet_id: int
    service_type: str
    appointment_date: datetime
    duration: int = 60
    address: str = ""
    contact_phone: str = ""
    remark: str = ""


class Appointment(BaseModel):
    id: int
    user_id: int
    pet_id: int
    pet_name: str
    service_type: str
    appointment_date: datetime
    duration: int
    price: float
    address: str
    contact_phone: str
    remark: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
