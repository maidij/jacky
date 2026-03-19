from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey
from datetime import datetime
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


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


class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    username = Column(String, default="")
    title = Column(String, nullable=False)
    content = Column(String, default="")
    image_urls = Column(String, default="")
    likes_count = Column(Integer, default=0)
    comments_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)


class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, nullable=False)
    user_id = Column(Integer, nullable=False)
    username = Column(String, default="")
    content = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Like(Base):
    __tablename__ = "likes"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, nullable=False)
    user_id = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
