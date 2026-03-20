from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Order as OrderModel, OrderItem as OrderItemModel, Cart as CartModel, Pet as PetModel
from app.schemas import OrderCreate, Order

router = APIRouter(prefix="/api/orders", tags=["订单"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("")
def create_order(order: OrderCreate, user_id: int = 1, db: Session = Depends(get_db)):
    cart_items = db.query(CartModel).filter(CartModel.user_id == user_id).all()
    
    if not cart_items:
        raise HTTPException(status_code=400, detail="购物车为空")
    
    total_amount = 0
    items_data = []
    
    for cart_item in cart_items:
        pet = db.query(PetModel).filter(PetModel.id == cart_item.pet_id).first()
        if pet:
            total_amount += pet.price * cart_item.quantity
            items_data.append({
                "pet_id": pet.id,
                "pet_name": pet.name,
                "pet_image": pet.image_url,
                "price": pet.price,
                "quantity": cart_item.quantity
            })
    
    db_order = OrderModel(
        user_id=user_id,
        total_amount=total_amount,
        receiver_name=order.receiver_name,
        phone=order.phone,
        address=order.address,
        status="pending"
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    
    for item in items_data:
        db_item = OrderItemModel(order_id=db_order.id, **item)
        db.add(db_item)
    
    for cart_item in cart_items:
        db.delete(cart_item)
    
    db.commit()
    return {"message": "订单创建成功", "order_id": db_order.id}


@router.get("")
def get_orders(user_id: int = 1, db: Session = Depends(get_db)):
    orders = db.query(OrderModel).filter(OrderModel.user_id == user_id).order_by(OrderModel.created_at.desc()).all()
    result = []
    for order in orders:
        items = db.query(OrderItemModel).filter(OrderItemModel.order_id == order.id).all()
        result.append({
            "id": order.id,
            "user_id": order.user_id,
            "total_amount": order.total_amount,
            "status": order.status,
            "receiver_name": order.receiver_name,
            "phone": order.phone,
            "address": order.address,
            "items": items,
            "created_at": order.created_at
        })
    return result


@router.put("/{order_id}")
def update_order_status(order_id: int, status: str, user_id: int = 1, db: Session = Depends(get_db)):
    order = db.query(OrderModel).filter(
        OrderModel.id == order_id,
        OrderModel.user_id == user_id
    ).first()
    if not order:
        raise HTTPException(status_code=404, detail="订单不存在")
    
    order.status = status
    db.commit()
    db.refresh(order)
    return order
