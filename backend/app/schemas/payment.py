from pydantic import BaseModel
from datetime import datetime


class PaymentCreate(BaseModel):
    order_id: int
    payment_method: str = "alipay"


class Payment(BaseModel):
    id: int
    order_id: int
    user_id: int
    amount: float
    payment_method: str
    status: str
    trade_no: str
    paid_at: datetime | None
    created_at: datetime

    class Config:
        from_attributes = True
