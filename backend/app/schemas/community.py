from pydantic import BaseModel
from datetime import datetime


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


class FavoriteCreate(BaseModel):
    pet_id: int


class Favorite(BaseModel):
    id: int
    user_id: int
    pet_id: int
    pet_name: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True
