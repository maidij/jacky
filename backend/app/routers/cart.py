from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Cart as CartModel, Pet as PetModel
from app.schemas import CartItemCreate, CartItemUpdate, CartItem, Pet

router = APIRouter(prefix="/api/cart", tags=["购物车"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("")
def get_cart(user_id: int = 1, db: Session = Depends(get_db)):
    cart_items = db.query(CartModel).filter(CartModel.user_id == user_id).all()
    result = []
    for item in cart_items:
        pet = db.query(PetModel).filter(PetModel.id == item.pet_id).first()
        if pet:
            result.append({
                "id": item.id,
                "user_id": item.user_id,
                "pet_id": item.pet_id,
                "quantity": item.quantity,
                "pet": pet
            })
    return result


@router.post("")
def add_to_cart(item: CartItemCreate, user_id: int = 1, db: Session = Depends(get_db)):
    existing = db.query(CartModel).filter(
        CartModel.user_id == user_id,
        CartModel.pet_id == item.pet_id
    ).first()
    
    if existing:
        existing.quantity += item.quantity
        db.commit()
        return {"message": "更新成功"}
    
    db_item = CartModel(user_id=user_id, pet_id=item.pet_id, quantity=item.quantity)
    db.add(db_item)
    db.commit()
    return {"message": "添加成功"}


@router.put("/{item_id}")
def update_cart_item(item_id: int, item: CartItemUpdate, user_id: int = 1, db: Session = Depends(get_db)):
    db_item = db.query(CartModel).filter(
        CartModel.id == item_id,
        CartModel.user_id == user_id
    ).first()
    if db_item is None:
        raise HTTPException(status_code=404, detail="购物车项不存在")
    
    db_item.quantity = item.quantity
    db.commit()
    return {"message": "更新成功"}


@router.delete("/{item_id}")
def remove_from_cart(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(CartModel).filter(CartModel.id == item_id).first()
    if db_item is None:
        raise HTTPException(status_code=404, detail="购物车项不存在")
    
    db.delete(db_item)
    db.commit()
    return {"message": "删除成功"}
