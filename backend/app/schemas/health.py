from pydantic import BaseModel
from datetime import datetime


class HealthRecordCreate(BaseModel):
    pet_id: int
    record_type: str
    record_date: datetime
    description: str = ""
    next_date: datetime | None = None
    hospital: str = ""
    cost: float = 0


class HealthRecord(BaseModel):
    id: int
    user_id: int
    pet_id: int
    pet_name: str
    record_type: str
    record_date: datetime
    description: str
    next_date: datetime | None = None
    hospital: str
    cost: float
    created_at: datetime

    class Config:
        from_attributes = True


class HealthRecordUpdate(BaseModel):
    record_type: str | None = None
    record_date: datetime | None = None
    description: str | None = None
    next_date: datetime | None = None
    hospital: str | None = None
    cost: float | None = None
