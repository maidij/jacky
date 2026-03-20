from app.database import Base
from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    pet_id = Column(Integer, nullable=False)
    pet_name = Column(String, default="")
    service_type = Column(String, nullable=False)
    appointment_date = Column(DateTime, nullable=False)
    duration = Column(Integer, default=60)
    price = Column(Float, default=0)
    address = Column(String, default="")
    contact_phone = Column(String, default="")
    remark = Column(String, default="")
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
