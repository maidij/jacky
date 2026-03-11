from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.database import Base


class Pet(Base):
    __tablename__ = "pets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    species = Column(String, nullable=False)
    category = Column(String, default="food")
    age = Column(Integer, nullable=False)
    description = Column(String, default="")
    image_url = Column(String, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
