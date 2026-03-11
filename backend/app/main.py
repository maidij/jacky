from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database import engine, SessionLocal
from app.models import Base, Pet as PetModel
from app.schemas import PetCreate, PetUpdate, Pet

Base.metadata.create_all(bind=engine)

app = FastAPI(title="宠物管理系统 API")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/")
def read_root():
    return {"message": "宠物管理系统 API", "version": "1.0.0"}


@app.get("/api/pets", response_model=List[Pet])
def get_pets(skip: int = 0, limit: int = 100, category: str = None, db: Session = Depends(get_db)):
    query = db.query(PetModel)
    if category:
        query = query.filter(PetModel.category == category)
    pets = query.offset(skip).limit(limit).all()
    return pets


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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
