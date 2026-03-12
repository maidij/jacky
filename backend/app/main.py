from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import hashlib

from app.database import engine, SessionLocal
from app.models import Base, Pet as PetModel, User as UserModel, Cart as CartModel, Order as OrderModel, OrderItem as OrderItemModel
from app.schemas import PetCreate, PetUpdate, Pet, UserCreate, User, CartItemCreate, CartItem, OrderCreate, Order

app = FastAPI(title="宠物管理系统 API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def verify_password(password: str, hashed: str) -> bool:
    return hash_password(password) == hashed

"""
这是宠物管理系统
"""

Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/")
def read_root():
    return {"message": "宠物管理系统 API", "version": "1.0.0"}


@app.post("/api/auth/register", response_model=User)
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(UserModel).filter(UserModel.username == user.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="用户名已存在")
    
    hashed_password = hash_password(user.password)
    db_user = UserModel(username=user.username, password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@app.post("/api/auth/login")
def login(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(UserModel).filter(UserModel.username == user.username).first()
    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="用户名或密码错误")
    
    return {"message": "登录成功", "user": {"id": db_user.id, "username": db_user.username}}


@app.get("/api/pets")
def get_pets(skip: int = 0, limit: int = 6, category: str = None, db: Session = Depends(get_db)):
    query = db.query(PetModel)
    if category:
        query = query.filter(PetModel.category == category)
    
    total = query.count()
    pets = query.offset(skip).limit(limit).all()
    
    return {
        "items": pets,
        "total": total,
        "page": skip // limit + 1,
        "pageSize": limit
    }

# 这是更新

@app.get("/api/pets/{pet_id}", response_model=Pet)
def get_pet(pet_id: int, db: Session = Depends(get_db)):
    pet = db.query(PetModel).filter(PetModel.id == pet_id).first()
    if pet is None:
        raise HTTPException(status_code=404, detail="宠物不存在")
    return pet


@app.post("/api/pets", response_model=Pet)
def create_pet(pet: PetCreate, db: Session = Depends(get_db)):
    db_pet = PetModel(**pet.model_dump())
    db.add(db_pet)
    db.commit()
    db.refresh(db_pet)
    return db_pet


@app.put("/api/pets/{pet_id}", response_model=Pet)
def update_pet(pet_id: int, pet: PetUpdate, db: Session = Depends(get_db)):
    db_pet = db.query(PetModel).filter(PetModel.id == pet_id).first()
    if db_pet is None:
        raise HTTPException(status_code=404, detail="宠物不存在")
    
    for key, value in pet.model_dump().items():
        setattr(db_pet, key, value)
    
    db.commit()
    db.refresh(db_pet)
    return db_pet


@app.delete("/api/pets/{pet_id}")
def delete_pet(pet_id: int, db: Session = Depends(get_db)):
    db_pet = db.query(PetModel).filter(PetModel.id == pet_id).first()
    if db_pet is None:
        raise HTTPException(status_code=404, detail="宠物不存在")
    
    db.delete(db_pet)
    db.commit()
    return {"message": "删除成功"}


@app.get("/api/cart")
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


@app.post("/api/cart")
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


@app.delete("/api/cart/{item_id}")
def remove_from_cart(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(CartModel).filter(CartModel.id == item_id).first()
    if db_item is None:
        raise HTTPException(status_code=404, detail="购物车项不存在")
    
    db.delete(db_item)
    db.commit()
    return {"message": "删除成功"}


@app.post("/api/orders")
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


@app.get("/api/orders")
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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
