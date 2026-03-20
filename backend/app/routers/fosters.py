from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import SessionLocal
from app.models import Foster as FosterModel, Pet as PetModel

router = APIRouter(prefix="/api/fosters", tags=["寄养"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("")
def create_foster(foster_data: dict, user_id: int = 1, db: Session = Depends(get_db)):
    pet = db.query(PetModel).filter(PetModel.id == foster_data["pet_id"]).first()
    if not pet:
        raise HTTPException(status_code=404, detail="宠物不存在")
    
    start_date = datetime.fromisoformat(foster_data["start_date"].replace("Z", "+00:00"))
    end_date = datetime.fromisoformat(foster_data["end_date"].replace("Z", "+00:00"))
    
    days = (end_date - start_date).days
    if days <= 0:
        raise HTTPException(status_code=400, detail="结束日期必须晚于开始日期")
    
    total_price = days * foster_data["daily_price"]
    
    db_foster = FosterModel(
        user_id=user_id,
        pet_id=foster_data["pet_id"],
        pet_name=pet.name,
        start_date=start_date,
        end_date=end_date,
        daily_price=foster_data["daily_price"],
        total_price=total_price,
        service_type=foster_data.get("service_type", "daycare"),
        contact_phone=foster_data.get("contact_phone", ""),
        address=foster_data.get("address", ""),
        remark=foster_data.get("remark", ""),
        status="pending"
    )
    db.add(db_foster)
    db.commit()
    db.refresh(db_foster)
    return db_foster


@router.get("")
def get_fosters(user_id: int = 1, db: Session = Depends(get_db)):
    fosters = db.query(FosterModel).filter(FosterModel.user_id == user_id).order_by(FosterModel.created_at.desc()).all()
    return fosters


@router.get("/{foster_id}")
def get_foster(foster_id: int, db: Session = Depends(get_db)):
    foster = db.query(FosterModel).filter(FosterModel.id == foster_id).first()
    if not foster:
        raise HTTPException(status_code=404, detail="寄养订单不存在")
    return foster


@router.put("/{foster_id}")
def update_foster_status(foster_id: int, status: str, db: Session = Depends(get_db)):
    foster = db.query(FosterModel).filter(FosterModel.id == foster_id).first()
    if not foster:
        raise HTTPException(status_code=404, detail="寄养订单不存在")
    
    foster.status = status
    db.commit()
    db.refresh(foster)
    return foster
