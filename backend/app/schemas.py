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


class PetUpdate(PetBase):
    pass


class Pet(PetBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
