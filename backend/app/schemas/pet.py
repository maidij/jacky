from pydantic import BaseModel
from datetime import datetime


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


class CartItemUpdate(BaseModel):
    quantity: int


class CartItem(BaseModel):
    id: int
    user_id: int
    pet_id: int
    quantity: int
    pet: Pet

    class Config:
        from_attributes = True
