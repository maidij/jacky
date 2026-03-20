from app.database import Base
from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime


class HealthRecord(Base):
    __tablename__ = "health_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    pet_id = Column(Integer, nullable=False)
    pet_name = Column(String, default="")
    record_type = Column(String, nullable=False)
    record_date = Column(DateTime, nullable=False)
    description = Column(String, default="")
    next_date = Column(DateTime, nullable=True)
    hospital = Column(String, default="")
    cost = Column(Float, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
