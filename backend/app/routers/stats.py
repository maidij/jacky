from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import SessionLocal
from app.models import User as UserModel, Pet as PetModel, Order as OrderModel, OrderItem as OrderItemModel

router = APIRouter(prefix="/api/stats", tags=["统计"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/overview")
def get_stats_overview(db: Session = Depends(get_db)):
    total_users = db.query(UserModel).count()
    total_orders = db.query(OrderModel).count()
    total_pets = db.query(PetModel).count()
    
    total_revenue = db.query(func.sum(OrderModel.total_amount)).filter(
        OrderModel.status != "cancelled"
    ).scalar() or 0
    
    pending_orders = db.query(OrderModel).filter(OrderModel.status == "pending").count()
    
    return {
        "total_users": total_users,
        "total_orders": total_orders,
        "total_pets": total_pets,
        "total_revenue": float(total_revenue),
        "pending_orders": pending_orders
    }


@router.get("/sales")
def get_sales_stats(db: Session = Depends(get_db)):
    from datetime import datetime, timedelta
    now = datetime.utcnow()
    start_date = now - timedelta(days=30)
    
    sales_by_category = db.query(
        PetModel.category,
        func.count(OrderItemModel.id).label("count"),
        func.sum(OrderItemModel.price * OrderItemModel.quantity).label("amount")
    ).join(OrderItemModel, PetModel.id == OrderItemModel.pet_id
    ).join(OrderModel, OrderItemModel.order_id == OrderModel.id
    ).filter(
        OrderModel.status != "cancelled",
        OrderModel.created_at >= start_date
    ).group_by(PetModel.category).all()
    
    return {
        "by_category": [
            {"category": s.category, "count": s.count, "amount": float(s.amount or 0)}
            for s in sales_by_category
        ]
    }


@router.get("/orders/trend")
def get_orders_trend(days: int = 7, db: Session = Depends(get_db)):
    from datetime import datetime, timedelta
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


@router.get("/pets")
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


@router.get("/users")
def get_users_stats(db: Session = Depends(get_db)):
    from datetime import datetime, timedelta
    
    total = db.query(UserModel).count()
    
    week_ago = datetime.utcnow() - timedelta(days=7)
    new_this_week = db.query(UserModel).filter(UserModel.created_at >= week_ago).count()
    
    return {
        "total": total,
        "new_this_week": new_this_week
    }
