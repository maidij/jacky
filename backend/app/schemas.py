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
