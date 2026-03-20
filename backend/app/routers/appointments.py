from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import SessionLocal
from app.models import Appointment as AppointmentModel, Pet as PetModel

router = APIRouter(prefix="/api/appointments", tags=["预约"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("")
def create_appointment(appt_data: dict, user_id: int = 1, db: Session = Depends(get_db)):
    pet = db.query(PetModel).filter(PetModel.id == appt_data["pet_id"]).first()
    if not pet:
        raise HTTPException(status_code=404, detail="宠物不存在")
    
    appointment_date = datetime.fromisoformat(appt_data["appointment_date"].replace("Z", "+00:00"))
    duration = appt_data.get("duration", 60)
    service_type = appt_data.get("service_type", "walk")
    
    price = 0
    if service_type == "walk":
        price = duration * 2
    elif service_type == "grooming":
        price = 100 + duration * 1.5
    elif service_type == "medical":
        price = 200 + duration * 3
    elif service_type == "training":
        price = 150 + duration * 2.5
    
    db_appt = AppointmentModel(
        user_id=user_id,
        pet_id=appt_data["pet_id"],
        pet_name=pet.name,
        service_type=service_type,
        appointment_date=appointment_date,
        duration=duration,
        price=price,
        address=appt_data.get("address", ""),
        contact_phone=appt_data.get("contact_phone", ""),
        remark=appt_data.get("remark", ""),
        status="pending"
    )
    db.add(db_appt)
    db.commit()
    db.refresh(db_appt)
    return db_appt


@router.get("")
def get_appointments(user_id: int = 1, status: str = None, db: Session = Depends(get_db)):
    query = db.query(AppointmentModel).filter(AppointmentModel.user_id == user_id)
    if status:
        query = query.filter(AppointmentModel.status == status)
    appointments = query.order_by(AppointmentModel.appointment_date.desc()).all()
    return appointments


@router.get("/{appointment_id}")
def get_appointment(appointment_id: int, db: Session = Depends(get_db)):
    appointment = db.query(AppointmentModel).filter(AppointmentModel.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="预约不存在")
    return appointment


@router.put("/{appointment_id}")
def update_appointment_status(appointment_id: int, status: str, db: Session = Depends(get_db)):
    appointment = db.query(AppointmentModel).filter(AppointmentModel.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="预约不存在")
    
    appointment.status = status
    db.commit()
    db.refresh(appointment)
    return appointment


@router.delete("/{appointment_id}")
def cancel_appointment(appointment_id: int, user_id: int = 1, db: Session = Depends(get_db)):
    appointment = db.query(AppointmentModel).filter(
        AppointmentModel.id == appointment_id,
        AppointmentModel.user_id == user_id
    ).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="预约不存在")
    
    appointment.status = "cancelled"
    db.commit()
    db.refresh(appointment)
    return {"message": "预约已取消"}
