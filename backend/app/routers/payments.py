from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import SessionLocal
from app.models import Payment as PaymentModel, Order as OrderModel

router = APIRouter(prefix="/api/payments", tags=["支付"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("")
def create_payment(payment_data: dict, user_id: int = 1, db: Session = Depends(get_db)):
    order = db.query(OrderModel).filter(OrderModel.id == payment_data["order_id"]).first()
    if not order:
        raise HTTPException(status_code=404, detail="订单不存在")
    
    db_payment = PaymentModel(
        order_id=payment_data["order_id"],
        user_id=user_id,
        amount=order.total_amount,
        payment_method=payment_data.get("payment_method", "alipay"),
        status="pending"
    )
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment


@router.post("/{payment_id}/pay")
def process_payment(payment_id: int, user_id: int = 1, db: Session = Depends(get_db)):
    payment = db.query(PaymentModel).filter(
        PaymentModel.id == payment_id,
        PaymentModel.user_id == user_id
    ).first()
    if not payment:
        raise HTTPException(status_code=404, detail="支付记录不存在")
    
    payment.status = "paid"
    payment.trade_no = f"PAY{datetime.utcnow().strftime('%Y%m%d%H%M%S')}{payment_id}"
    payment.paid_at = datetime.utcnow()
    
    order = db.query(OrderModel).filter(OrderModel.id == payment.order_id).first()
    if order:
        order.status = "paid"
    
    db.commit()
    db.refresh(payment)
    return payment


@router.get("")
def get_payments(user_id: int = 1, db: Session = Depends(get_db)):
    payments = db.query(PaymentModel).filter(
        PaymentModel.user_id == user_id
    ).order_by(PaymentModel.created_at.desc()).all()
    return payments


@router.get("/{payment_id}")
def get_payment(payment_id: int, db: Session = Depends(get_db)):
    payment = db.query(PaymentModel).filter(PaymentModel.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="支付记录不存在")
    return payment
