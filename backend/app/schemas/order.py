from pydantic import BaseModel
from datetime import datetime


class OrderCreate(BaseModel):
    receiver_name: str
    phone: str
    address: str


class OrderItemSchema(BaseModel):
    pet_id: int
    pet_name: str
    pet_image: str
    price: float
    quantity: int


class Order(BaseModel):
    id: int
    user_id: int
    total_amount: float
    status: str
    receiver_name: str
    phone: str
    address: str
    items: list = []
    created_at: datetime

    class Config:
        from_attributes = True


class ReviewCreate(BaseModel):
    pet_id: int
    rating: int
    comment: str


class Review(BaseModel):
    id: int
    pet_id: int
    user_id: int
    username: str
    rating: int
    comment: str
    created_at: datetime

    class Config:
        from_attributes = True
