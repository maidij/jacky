from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime
import hashlib

from app.database import engine, SessionLocal
from app.models import Base, Pet as PetModel, User as UserModel, Cart as CartModel, Order as OrderModel, OrderItem as OrderItemModel, Review as ReviewModel, Transport as TransportModel, Foster as FosterModel, HealthRecord as HealthRecordModel, Post as PostModel, Comment as CommentModel, Like as LikeModel
from app.schemas import PetCreate, PetUpdate, Pet, UserCreate, User, CartItemCreate, CartItem, OrderCreate, Order, ReviewCreate, Review, TransportCreate, Transport, FosterCreate, Foster, HealthRecordCreate, HealthRecord, HealthRecordUpdate, PostCreate, Post, CommentCreate, Comment

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


@app.get("/api/pets/search")
def search_pets(q: str = "", skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    query = db.query(PetModel)
    if q:
        query = query.filter(
            (PetModel.name.contains(q)) | 
            (PetModel.description.contains(q)) |
            (PetModel.species.contains(q))
        )
    
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


@app.get("/api/reviews/{pet_id}")
def get_reviews(pet_id: int, db: Session = Depends(get_db)):
    reviews = db.query(ReviewModel).filter(ReviewModel.pet_id == pet_id).order_by(ReviewModel.created_at.desc()).all()
    return reviews


@app.post("/api/reviews")
def create_review(review: ReviewCreate, user_id: int = 1, username: str = "用户", db: Session = Depends(get_db)):
    db_review = ReviewModel(
        pet_id=review.pet_id,
        user_id=user_id,
        username=username,
        rating=review.rating,
        comment=review.comment
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return {"message": "评价成功"}


@app.get("/api/reviews/{pet_id}/stats")
def get_review_stats(pet_id: int, db: Session = Depends(get_db)):
    reviews = db.query(ReviewModel).filter(ReviewModel.pet_id == pet_id).all()
    if not reviews:
        return {"average": 0, "count": 0}
    
    total = sum(r.rating for r in reviews)
    return {"average": round(total / len(reviews), 1), "count": len(reviews)}


@app.post("/api/transports", response_model=Transport)
def create_transport(transport: TransportCreate, user_id: int = 1, db: Session = Depends(get_db)):
    pet = db.query(PetModel).filter(PetModel.id == transport.pet_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="宠物不存在")
    
    price = 0
    if transport.transport_type == "express":
        price = 50 + transport.pet_weight * 10
    elif transport.transport_type == "standard":
        price = 30 + transport.pet_weight * 5
    elif transport.transport_type == "door_to_door":
        price = 80 + transport.pet_weight * 15
    
    db_transport = TransportModel(
        user_id=user_id,
        pet_id=transport.pet_id,
        pet_name=pet.name,
        pickup_address=transport.pickup_address,
        delivery_address=transport.delivery_address,
        transport_type=transport.transport_type,
        pet_weight=transport.pet_weight,
        price=price,
        contact_phone=transport.contact_phone,
        remark=transport.remark,
        status="pending"
    )
    db.add(db_transport)
    db.commit()
    db.refresh(db_transport)
    return db_transport


@app.get("/api/transports")
def get_transports(user_id: int = 1, db: Session = Depends(get_db)):
    transports = db.query(TransportModel).filter(TransportModel.user_id == user_id).order_by(TransportModel.created_at.desc()).all()
    return transports


@app.get("/api/transports/{transport_id}")
def get_transport(transport_id: int, db: Session = Depends(get_db)):
    transport = db.query(TransportModel).filter(TransportModel.id == transport_id).first()
    if not transport:
        raise HTTPException(status_code=404, detail="托运订单不存在")
    return transport


@app.put("/api/transports/{transport_id}")
def update_transport_status(transport_id: int, status: str, db: Session = Depends(get_db)):
    transport = db.query(TransportModel).filter(TransportModel.id == transport_id).first()
    if not transport:
        raise HTTPException(status_code=404, detail="托运订单不存在")
    
    transport.status = status
    db.commit()
    db.refresh(transport)
    return transport


@app.post("/api/fosters", response_model=Foster)
def create_foster(foster: FosterCreate, user_id: int = 1, db: Session = Depends(get_db)):
    pet = db.query(PetModel).filter(PetModel.id == foster.pet_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="宠物不存在")
    
    days = (foster.end_date - foster.start_date).days
    if days <= 0:
        raise HTTPException(status_code=400, detail="结束日期必须晚于开始日期")
    
    total_price = days * foster.daily_price
    
    db_foster = FosterModel(
        user_id=user_id,
        pet_id=foster.pet_id,
        pet_name=pet.name,
        start_date=foster.start_date,
        end_date=foster.end_date,
        daily_price=foster.daily_price,
        total_price=total_price,
        service_type=foster.service_type,
        contact_phone=foster.contact_phone,
        address=foster.address,
        remark=foster.remark,
        status="pending"
    )
    db.add(db_foster)
    db.commit()
    db.refresh(db_foster)
    return db_foster


@app.get("/api/fosters")
def get_fosters(user_id: int = 1, db: Session = Depends(get_db)):
    fosters = db.query(FosterModel).filter(FosterModel.user_id == user_id).order_by(FosterModel.created_at.desc()).all()
    return fosters


@app.get("/api/fosters/{foster_id}")
def get_foster(foster_id: int, db: Session = Depends(get_db)):
    foster = db.query(FosterModel).filter(FosterModel.id == foster_id).first()
    if not foster:
        raise HTTPException(status_code=404, detail="寄养订单不存在")
    return foster


@app.put("/api/fosters/{foster_id}")
def update_foster_status(foster_id: int, status: str, db: Session = Depends(get_db)):
    foster = db.query(FosterModel).filter(FosterModel.id == foster_id).first()
    if not foster:
        raise HTTPException(status_code=404, detail="寄养订单不存在")
    
    foster.status = status
    db.commit()
    db.refresh(foster)
    return foster


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


@app.get("/api/health-records/{pet_id}")
def get_health_records(pet_id: int, user_id: int = 1, db: Session = Depends(get_db)):
    records = db.query(HealthRecordModel).filter(
        HealthRecordModel.pet_id == pet_id,
        HealthRecordModel.user_id == user_id
    ).order_by(HealthRecordModel.record_date.desc()).all()
    return records


@app.get("/api/health-records/{pet_id}/upcoming")
def get_upcoming_reminders(pet_id: int, user_id: int = 1, days: int = 30, db: Session = Depends(get_db)):
    from datetime import timedelta
    now = datetime.utcnow()
    future = now + timedelta(days=days)
    
    records = db.query(HealthRecordModel).filter(
        HealthRecordModel.pet_id == pet_id,
        HealthRecordModel.user_id == user_id,
        HealthRecordModel.next_date != None,
        HealthRecordModel.next_date <= future
    ).order_by(HealthRecordModel.next_date.asc()).all()
    return records


@app.post("/api/health-records", response_model=HealthRecord)
def create_health_record(record: HealthRecordCreate, user_id: int = 1, db: Session = Depends(get_db)):
    pet = db.query(PetModel).filter(PetModel.id == record.pet_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="宠物不存在")
    
    db_record = HealthRecordModel(
        user_id=user_id,
        pet_id=record.pet_id,
        pet_name=pet.name,
        record_type=record.record_type,
        record_date=record.record_date,
        description=record.description,
        next_date=record.next_date,
        hospital=record.hospital,
        cost=record.cost
    )
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record


@app.put("/api/health-records/{record_id}", response_model=HealthRecord)
def update_health_record(record_id: int, record: HealthRecordUpdate, user_id: int = 1, db: Session = Depends(get_db)):
    db_record = db.query(HealthRecordModel).filter(
        HealthRecordModel.id == record_id,
        HealthRecordModel.user_id == user_id
    ).first()
    if not db_record:
        raise HTTPException(status_code=404, detail="记录不存在")
    
    for key, value in record.model_dump(exclude_unset=True).items():
        if value is not None:
            setattr(db_record, key, value)
    
    db.commit()
    db.refresh(db_record)
    return db_record


@app.delete("/api/health-records/{record_id}")
def delete_health_record(record_id: int, user_id: int = 1, db: Session = Depends(get_db)):
    db_record = db.query(HealthRecordModel).filter(
        HealthRecordModel.id == record_id,
        HealthRecordModel.user_id == user_id
    ).first()
    if not db_record:
        raise HTTPException(status_code=404, detail="记录不存在")
    
    db.delete(db_record)
    db.commit()
    return {"message": "删除成功"}


@app.get("/api/posts")
def get_posts(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    posts = db.query(PostModel).order_by(PostModel.created_at.desc()).offset(skip).limit(limit).all()
    total = db.query(PostModel).count()
    return {"items": posts, "total": total, "page": skip // limit + 1, "pageSize": limit}


@app.get("/api/posts/{post_id}")
def get_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(PostModel).filter(PostModel.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="帖子不存在")
    return post


@app.post("/api/posts", response_model=Post)
def create_post(post: PostCreate, user_id: int = 1, username: str = "用户", db: Session = Depends(get_db)):
    db_post = PostModel(
        user_id=user_id,
        username=username,
        title=post.title,
        content=post.content,
        image_urls=post.image_urls
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post


@app.delete("/api/posts/{post_id}")
def delete_post(post_id: int, user_id: int = 1, db: Session = Depends(get_db)):
    post = db.query(PostModel).filter(PostModel.id == post_id, PostModel.user_id == user_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="帖子不存在或无权删除")
    
    db.query(CommentModel).filter(CommentModel.post_id == post_id).delete()
    db.query(LikeModel).filter(LikeModel.post_id == post_id).delete()
    db.delete(post)
    db.commit()
    return {"message": "删除成功"}


@app.post("/api/posts/{post_id}/like")
def toggle_like(post_id: int, user_id: int = 1, db: Session = Depends(get_db)):
    post = db.query(PostModel).filter(PostModel.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="帖子不存在")
    
    existing = db.query(LikeModel).filter(LikeModel.post_id == post_id, LikeModel.user_id == user_id).first()
    
    if existing:
        db.delete(existing)
        post.likes_count = max(0, post.likes_count - 1)
        liked = False
    else:
        db_like = LikeModel(post_id=post_id, user_id=user_id)
        db.add(db_like)
        post.likes_count += 1
        liked = True
    
    db.commit()
    db.refresh(post)
    return {"liked": liked, "likes_count": post.likes_count}


@app.get("/api/posts/{post_id}/comments")
def get_comments(post_id: int, db: Session = Depends(get_db)):
    comments = db.query(CommentModel).filter(CommentModel.post_id == post_id).order_by(CommentModel.created_at.asc()).all()
    return comments


@app.post("/api/posts/{post_id}/comments", response_model=Comment)
def create_comment(post_id: int, comment: CommentCreate, user_id: int = 1, username: str = "用户", db: Session = Depends(get_db)):
    post = db.query(PostModel).filter(PostModel.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="帖子不存在")
    
    db_comment = CommentModel(
        post_id=post_id,
        user_id=user_id,
        username=username,
        content=comment.content
    )
    db.add(db_comment)
    post.comments_count += 1
    db.commit()
    db.refresh(db_comment)
    return db_comment


@app.delete("/api/comments/{comment_id}")
def delete_comment(comment_id: int, user_id: int = 1, db: Session = Depends(get_db)):
    comment = db.query(CommentModel).filter(CommentModel.id == comment_id, CommentModel.user_id == user_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="评论不存在或无权删除")
    
    post = db.query(PostModel).filter(PostModel.id == comment.post_id).first()
    if post:
        post.comments_count = max(0, post.comments_count - 1)
    
    db.delete(comment)
    db.commit()
    return {"message": "删除成功"}


@app.get("/api/stats/overview")
def get_stats_overview(db: Session = Depends(get_db)):
    total_users = db.query(UserModel).count()
    total_orders = db.query(OrderModel).count()
    total_pets = db.query(PetModel).count()
    total_revenue = db.query(OrderModel).filter(OrderModel.status != "cancelled").with_entities(
        func.coalesce(func.sum(OrderModel.total_amount), 0)
    ).scalar() or 0
    
    pending_orders = db.query(OrderModel).filter(OrderModel.status == "pending").count()
    
    return {
        "total_users": total_users,
        "total_orders": total_orders,
        "total_pets": total_pets,
        "total_revenue": float(total_revenue),
        "pending_orders": pending_orders
    }


@app.get("/api/stats/sales")
def get_sales_stats(db: Session = Depends(get_db)):
    sales_by_category = db.query(
        PetModel.category,
        func.count(OrderItemModel.id).label("count"),
        func.sum(OrderItemModel.price * OrderItemModel.quantity).label("amount")
    ).join(OrderItemModel, PetModel.id == OrderItemModel.pet_id
    ).join(OrderModel, OrderItemModel.order_id == OrderModel.id
    ).filter(OrderModel.status != "cancelled"
    ).group_by(PetModel.category).all()
    
    return {
        "by_category": [
            {"category": s.category, "count": s.count, "amount": float(s.amount or 0)}
            for s in sales_by_category
        ]
    }


@app.get("/api/stats/orders/trend")
def get_orders_trend(days: int = 7, db: Session = Depends(get_db)):
    from datetime import timedelta
    now = datetime.utcnow()
    start_date = now - timedelta(days=days)
    
    orders = db.query(
        func.date(OrderModel.created_at).label("date"),
        func.count(OrderModel.id).label("count"),
        func.sum(OrderModel.total_amount).label("amount")
    ).filter(
        OrderModel.created_at >= start_date,
        OrderModel.status != "cancelled"
    ).group_by(func.date(OrderModel.created_at)).all()
    
    return {
        "trend": [
            {"date": str(o.date), "count": o.count, "amount": float(o.amount or 0)}
            for o in orders
        ]
    }


@app.get("/api/stats/pets")
def get_pets_stats(db: Session = Depends(get_db)):
    by_species = db.query(
        PetModel.species,
        func.count(PetModel.id).label("count")
    ).group_by(PetModel.species).all()
    
    by_category = db.query(
        PetModel.category,
        func.count(PetModel.id).label("count")
    ).group_by(PetModel.category).all()
    
    return {
        "by_species": [{"species": s.species, "count": s.count} for s in by_species],
        "by_category": [{"category": c.category, "count": c.count} for c in by_category]
    }
