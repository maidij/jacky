from app.database import Base
from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    password = Column(String, nullable=False)
    role = Column(String, default="user")
    email = Column(String, default="")
    phone = Column(String, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
