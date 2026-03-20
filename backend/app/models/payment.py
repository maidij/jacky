from app.database import Base
from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, nullable=False)
    user_id = Column(Integer, nullable=False)
    amount = Column(Float, default=0)
    payment_method = Column(String, default="alipay")
    status = Column(String, default="pending")
    trade_no = Column(String, default="")
    paid_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
