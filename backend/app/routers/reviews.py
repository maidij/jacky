from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Review as ReviewModel

router = APIRouter(prefix="/api/reviews", tags=["评价"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/{pet_id}")
def get_reviews(pet_id: int, db: Session = Depends(get_db)):
    reviews = db.query(ReviewModel).filter(ReviewModel.pet_id == pet_id).order_by(ReviewModel.created_at.desc()).all()
    return reviews


@router.post("")
def create_review(review_data: dict, user_id: int = 1, username: str = "用户", db: Session = Depends(get_db)):
    db_review = ReviewModel(
        pet_id=review_data["pet_id"],
        user_id=user_id,
        username=username,
        rating=review_data["rating"],
        comment=review_data["comment"]
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return {"message": "评价成功"}


@router.get("/{pet_id}/stats")
def get_review_stats(pet_id: int, db: Session = Depends(get_db)):
    reviews = db.query(ReviewModel).filter(ReviewModel.pet_id == pet_id).all()
    if not reviews:
        return {"average": 0, "count": 0}
    
    total = sum(r.rating for r in reviews)
    return {"average": round(total / len(reviews), 1), "count": len(reviews)}
