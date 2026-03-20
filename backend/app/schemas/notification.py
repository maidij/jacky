from pydantic import BaseModel
from datetime import datetime


class NotificationCreate(BaseModel):
    title: str
    content: str = ""
    type: str = "info"
    related_id: int | None = None


class Notification(BaseModel):
    id: int
    user_id: int
    title: str
    content: str
    type: str
    is_read: int
    related_id: int | None
    created_at: datetime

    class Config:
        from_attributes = True
