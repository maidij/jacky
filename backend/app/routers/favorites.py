from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Favorite as FavoriteModel, Pet as PetModel

router = APIRouter(prefix="/api/favorites", tags=["收藏"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("")
def get_favorites(user_id: int = 1, db: Session = Depends(get_db)):
    favorites = db.query(FavoriteModel).filter(FavoriteModel.user_id == user_id).order_by(FavoriteModel.created_at.desc()).all()
    result = []
    for fav in favorites:
        pet = db.query(PetModel).filter(PetModel.id == fav.pet_id).first()
        if pet:
            result.append({
                "id": fav.id,
                "user_id": fav.user_id,
                "pet_id": fav.pet_id,
                "created_at": fav.created_at,
                "pet_name": pet.name,
                "pet": pet
            })
    return result


@router.post("")
def add_favorite(fav_data: dict, user_id: int = 1, db: Session = Depends(get_db)):
    existing = db.query(FavoriteModel).filter(
        FavoriteModel.user_id == user_id,
        FavoriteModel.pet_id == fav_data["pet_id"]
    ).first()
    if existing:
        return existing
    
    db_fav = FavoriteModel(user_id=user_id, pet_id=fav_data["pet_id"])
    db.add(db_fav)
    db.commit()
    db.refresh(db_fav)
    return db_fav


@router.delete("/{pet_id}")
def remove_favorite(pet_id: int, user_id: int = 1, db: Session = Depends(get_db)):
    fav = db.query(FavoriteModel).filter(
        FavoriteModel.user_id == user_id,
        FavoriteModel.pet_id == pet_id
    ).first()
    if not fav:
        raise HTTPException(status_code=404, detail="收藏不存在")
    
    db.delete(fav)
    db.commit()
    return {"message": "取消收藏成功"}


@router.get("/check/{pet_id}")
def check_favorite(pet_id: int, user_id: int = 1, db: Session = Depends(get_db)):
    existing = db.query(FavoriteModel).filter(
        FavoriteModel.user_id == user_id,
        FavoriteModel.pet_id == pet_id
    ).first()
    return {"is_favorited": existing is not None}
