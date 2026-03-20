from app.database import Base
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from datetime import datetime


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    total_amount = Column(Float, default=0)
    status = Column(String, default="pending")
    receiver_name = Column(String, default="")
    phone = Column(String, default="")
    address = Column(String, default="")
    created_at = Column(DateTime, default=datetime.utcnow)


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, nullable=False)
    pet_id = Column(Integer, nullable=False)
    pet_name = Column(String, default="")
    pet_image = Column(String, default="")
    price = Column(Float, default=0)
    quantity = Column(Integer, default=1)


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    pet_id = Column(Integer, nullable=False)
    user_id = Column(Integer, nullable=False)
    username = Column(String, default="")
    rating = Column(Integer, default=5)
    comment = Column(String, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
