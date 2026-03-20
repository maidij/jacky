from app.database import Base
from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime


class Address(Base):
    __tablename__ = "addresses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    province = Column(String, default="")
    city = Column(String, default="")
    district = Column(String, default="")
    detail = Column(String, default="")
    is_default = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
