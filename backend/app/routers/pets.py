from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Pet as PetModel
from app.schemas import PetCreate, PetUpdate, Pet

router = APIRouter(prefix="/api/pets", tags=["宠物"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("")
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


@router.get("/search")
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


@router.get("/{pet_id}", response_model=Pet)
def get_pet(pet_id: int, db: Session = Depends(get_db)):
    pet = db.query(PetModel).filter(PetModel.id == pet_id).first()
    if pet is None:
        raise HTTPException(status_code=404, detail="宠物不存在")
    return pet


@router.post("", response_model=Pet)
def create_pet(pet: PetCreate, db: Session = Depends(get_db)):
    db_pet = PetModel(**pet.model_dump())
    db.add(db_pet)
    db.commit()
    db.refresh(db_pet)
    return db_pet


@router.put("/{pet_id}", response_model=Pet)
def update_pet(pet_id: int, pet: PetUpdate, db: Session = Depends(get_db)):
    db_pet = db.query(PetModel).filter(PetModel.id == pet_id).first()
    if db_pet is None:
        raise HTTPException(status_code=404, detail="宠物不存在")
    
    for key, value in pet.model_dump().items():
        setattr(db_pet, key, value)
    
    db.commit()
    db.refresh(db_pet)
    return db_pet


@router.delete("/{pet_id}")
def delete_pet(pet_id: int, db: Session = Depends(get_db)):
    db_pet = db.query(PetModel).filter(PetModel.id == pet_id).first()
    if db_pet is None:
        raise HTTPException(status_code=404, detail="宠物不存在")
    
    db.delete(db_pet)
    db.commit()
    return {"message": "删除成功"}
