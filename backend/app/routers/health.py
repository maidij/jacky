from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.database import SessionLocal
from app.models import HealthRecord as HealthRecordModel, Pet as PetModel

router = APIRouter(prefix="/api/health-records", tags=["健康档案"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/{pet_id}")
def get_health_records(pet_id: int, user_id: int = 1, db: Session = Depends(get_db)):
    records = db.query(HealthRecordModel).filter(
        HealthRecordModel.pet_id == pet_id,
        HealthRecordModel.user_id == user_id
    ).order_by(HealthRecordModel.record_date.desc()).all()
    return records


@router.get("/{pet_id}/upcoming")
def get_upcoming_reminders(pet_id: int, user_id: int = 1, days: int = 30, db: Session = Depends(get_db)):
    now = datetime.utcnow()
    future = now + timedelta(days=days)
    
    records = db.query(HealthRecordModel).filter(
        HealthRecordModel.pet_id == pet_id,
        HealthRecordModel.user_id == user_id,
        HealthRecordModel.next_date != None,
        HealthRecordModel.next_date <= future
    ).order_by(HealthRecordModel.next_date.asc()).all()
    return records


@router.post("")
def create_health_record(record_data: dict, user_id: int = 1, db: Session = Depends(get_db)):
    pet = db.query(PetModel).filter(PetModel.id == record_data["pet_id"]).first()
    if not pet:
        raise HTTPException(status_code=404, detail="宠物不存在")
    
    record_date = datetime.fromisoformat(record_data["record_date"].replace("Z", "+00:00"))
    next_date = None
    if record_data.get("next_date"):
        next_date = datetime.fromisoformat(record_data["next_date"].replace("Z", "+00:00"))
    
    db_record = HealthRecordModel(
        user_id=user_id,
        pet_id=record_data["pet_id"],
        pet_name=pet.name,
        record_type=record_data["record_type"],
        record_date=record_date,
        description=record_data.get("description", ""),
        next_date=next_date,
        hospital=record_data.get("hospital", ""),
        cost=record_data.get("cost", 0)
    )
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record


@router.put("/{record_id}")
def update_health_record(record_id: int, record_data: dict, user_id: int = 1, db: Session = Depends(get_db)):
    db_record = db.query(HealthRecordModel).filter(
        HealthRecordModel.id == record_id,
        HealthRecordModel.user_id == user_id
    ).first()
    if not db_record:
        raise HTTPException(status_code=404, detail="记录不存在")
    
    for key, value in record_data.items():
        if value is not None:
            setattr(db_record, key, value)
    
    db.commit()
    db.refresh(db_record)
    return db_record


@router.delete("/{record_id}")
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
