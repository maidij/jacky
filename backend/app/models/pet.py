from app.database import Base
from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime


class Pet(Base):
    __tablename__ = "pets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    species = Column(String, nullable=False)
    category = Column(String, default="food")
    age = Column(Integer, nullable=False)
    description = Column(String, default="")
    image_url = Column(String, default="")
    price = Column(Float, default=0)
    stock = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)


class Cart(Base):
    __tablename__ = "cart"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    pet_id = Column(Integer, nullable=False)
    quantity = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
