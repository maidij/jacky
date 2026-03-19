from pydantic import BaseModel
from datetime import datetime


class UserCreate(BaseModel):
    username: str
    password: str


class User(BaseModel):
    id: int
    username: str
    created_at: datetime

    class Config:
        from_attributes = True


class PetBase(BaseModel):
    name: str
    species: str
    category: str = "food"
    age: int
    description: str = ""
    image_url: str = ""


class PetCreate(PetBase):
    pass


class PetUpdate(BaseModel):
    name: str | None = None
    species: str | None = None
    category: str | None = "food"
    age: int | None = None
    description: str | None = ""
    image_url: str | None = ""
    price: float | None = 0
    stock: int | None = 0


class Pet(PetBase):
    id: int
    price: float = 0
    stock: int = 0
    created_at: datetime

    class Config:
        from_attributes = True


class CartItemCreate(BaseModel):
    pet_id: int
    quantity: int = 1


class CartItem(BaseModel):
    id: int
    user_id: int
    pet_id: int
    quantity: int
    pet: Pet

    class Config:
        from_attributes = True


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


class TransportCreate(BaseModel):
    pet_id: int
    pickup_address: str
    delivery_address: str
    transport_type: str = "express"
    pet_weight: float = 0
    contact_phone: str = ""
    remark: str = ""


class Transport(BaseModel):
    id: int
    user_id: int
    pet_id: int
    pet_name: str
    pickup_address: str
    delivery_address: str
    transport_type: str
    pet_weight: float
    price: float
    status: str
    contact_phone: str
    remark: str
    created_at: datetime

    class Config:
        from_attributes = True


class FosterCreate(BaseModel):
    pet_id: int
    start_date: datetime
    end_date: datetime
    daily_price: float
    service_type: str = "daycare"
    contact_phone: str = ""
    address: str = ""
    remark: str = ""


class Foster(BaseModel):
    id: int
    user_id: int
    pet_id: int
    pet_name: str
    start_date: datetime
    end_date: datetime
    daily_price: float
    total_price: float
    status: str
    service_type: str
    contact_phone: str
    address: str
    remark: str
    created_at: datetime

    class Config:
        from_attributes = True


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


class PostCreate(BaseModel):
    title: str
    content: str = ""
    image_urls: str = ""


class Post(BaseModel):
    id: int
    user_id: int
    username: str
    title: str
    content: str
    image_urls: str
    likes_count: int
    comments_count: int
    created_at: datetime

    class Config:
        from_attributes = True


class CommentCreate(BaseModel):
    content: str


class Comment(BaseModel):
    id: int
    post_id: int
    user_id: int
    username: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True
