from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Transport as TransportModel, Foster as FosterModel, Pet as PetModel

router = APIRouter(prefix="/api/transports", tags=["托运"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("")
def create_transport(transport_data: dict, user_id: int = 1, db: Session = Depends(get_db)):
    pet = db.query(PetModel).filter(PetModel.id == transport_data["pet_id"]).first()
    if not pet:
        raise HTTPException(status_code=404, detail="宠物不存在")
    
    price = 0
    transport_type = transport_data.get("transport_type", "express")
    pet_weight = transport_data.get("pet_weight", 0)
    
    if transport_type == "express":
        price = 50 + pet_weight * 10
    elif transport_type == "standard":
        price = 30 + pet_weight * 5
    elif transport_type == "door_to_door":
        price = 80 + pet_weight * 15
    
    db_transport = TransportModel(
        user_id=user_id,
        pet_id=transport_data["pet_id"],
        pet_name=pet.name,
        pickup_address=transport_data["pickup_address"],
        delivery_address=transport_data["delivery_address"],
        transport_type=transport_type,
        pet_weight=pet_weight,
        price=price,
        contact_phone=transport_data.get("contact_phone", ""),
        remark=transport_data.get("remark", ""),
        status="pending"
    )
    db.add(db_transport)
    db.commit()
    db.refresh(db_transport)
    return db_transport


@router.get("")
def get_transports(user_id: int = 1, db: Session = Depends(get_db)):
    transports = db.query(TransportModel).filter(TransportModel.user_id == user_id).order_by(TransportModel.created_at.desc()).all()
    return transports


@router.get("/{transport_id}")
def get_transport(transport_id: int, db: Session = Depends(get_db)):
    transport = db.query(TransportModel).filter(TransportModel.id == transport_id).first()
    if not transport:
        raise HTTPException(status_code=404, detail="托运订单不存在")
    return transport


@router.put("/{transport_id}")
def update_transport_status(transport_id: int, status: str, db: Session = Depends(get_db)):
    transport = db.query(TransportModel).filter(TransportModel.id == transport_id).first()
    if not transport:
        raise HTTPException(status_code=404, detail="托运订单不存在")
    
    transport.status = status
    db.commit()
    db.refresh(transport)
    return transport
