from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import SessionLocal
from app.models import Address as AddressModel

router = APIRouter(prefix="/api/addresses", tags=["地址"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("")
def get_addresses(user_id: int = 1, db: Session = Depends(get_db)):
    addresses = db.query(AddressModel).filter(
        AddressModel.user_id == user_id
    ).order_by(AddressModel.is_default.desc(), AddressModel.created_at.desc()).all()
    return addresses


@router.post("")
def create_address(addr_data: dict, user_id: int = 1, db: Session = Depends(get_db)):
    if addr_data.get("is_default", False):
        db.query(AddressModel).filter(AddressModel.user_id == user_id).update({"is_default": 0})
    
    db_addr = AddressModel(
        user_id=user_id,
        name=addr_data["name"],
        phone=addr_data["phone"],
        province=addr_data.get("province", ""),
        city=addr_data.get("city", ""),
        district=addr_data.get("district", ""),
        detail=addr_data.get("detail", ""),
        is_default=1 if addr_data.get("is_default", False) else 0
    )
    db.add(db_addr)
    db.commit()
    db.refresh(db_addr)
    return db_addr


@router.put("/{address_id}")
def update_address(address_id: int, addr_data: dict, user_id: int = 1, db: Session = Depends(get_db)):
    db_addr = db.query(AddressModel).filter(
        AddressModel.id == address_id,
        AddressModel.user_id == user_id
    ).first()
    if not db_addr:
        raise HTTPException(status_code=404, detail="地址不存在")
    
    if addr_data.get("is_default", False):
        db.query(AddressModel).filter(AddressModel.user_id == user_id).update({"is_default": 0})
    
    for key, value in addr_data.items():
        if key == "is_default":
            setattr(db_addr, key, 1 if value else 0)
        else:
            setattr(db_addr, key, value)
    
    db.commit()
    db.refresh(db_addr)
    return db_addr


@router.delete("/{address_id}")
def delete_address(address_id: int, user_id: int = 1, db: Session = Depends(get_db)):
    db_addr = db.query(AddressModel).filter(
        AddressModel.id == address_id,
        AddressModel.user_id == user_id
    ).first()
    if not db_addr:
        raise HTTPException(status_code=404, detail="地址不存在")
    
    db.delete(db_addr)
    db.commit()
    return {"message": "删除成功"}
