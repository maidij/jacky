from app.database import Base
from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime


class Transport(Base):
    __tablename__ = "transports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    pet_id = Column(Integer, nullable=False)
    pet_name = Column(String, default="")
    pickup_address = Column(String, nullable=False)
    delivery_address = Column(String, nullable=False)
    transport_type = Column(String, default="express")
    pet_weight = Column(Float, default=0)
    price = Column(Float, default=0)
    status = Column(String, default="pending")
    contact_phone = Column(String, default="")
    remark = Column(String, default="")
    created_at = Column(DateTime, default=datetime.utcnow)


class Foster(Base):
    __tablename__ = "fosters"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    pet_id = Column(Integer, nullable=False)
    pet_name = Column(String, default="")
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    daily_price = Column(Float, default=0)
    total_price = Column(Float, default=0)
    status = Column(String, default="pending")
    service_type = Column(String, default="daycare")
    contact_phone = Column(String, default="")
    address = Column(String, default="")
    remark = Column(String, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
