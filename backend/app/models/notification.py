from app.database import Base
from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    title = Column(String, nullable=False)
    content = Column(String, default="")
    type = Column(String, default="info")
    is_read = Column(Integer, default=0)
    related_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
