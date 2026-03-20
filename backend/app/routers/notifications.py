from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Notification as NotificationModel

router = APIRouter(prefix="/api/notifications", tags=["通知"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("")
def get_notifications(user_id: int = 1, unread_only: bool = False, db: Session = Depends(get_db)):
    query = db.query(NotificationModel).filter(NotificationModel.user_id == user_id)
    if unread_only:
        query = query.filter(NotificationModel.is_read == 0)
    notifications = query.order_by(NotificationModel.created_at.desc()).limit(50).all()
    return notifications


@router.get("/unread-count")
def get_unread_count(user_id: int = 1, db: Session = Depends(get_db)):
    count = db.query(NotificationModel).filter(
        NotificationModel.user_id == user_id,
        NotificationModel.is_read == 0
    ).count()
    return {"count": count}


@router.post("")
def create_notification(notif_data: dict, user_id: int = 1, db: Session = Depends(get_db)):
    db_notif = NotificationModel(
        user_id=user_id,
        title=notif_data["title"],
        content=notif_data.get("content", ""),
        type=notif_data.get("type", "info"),
        related_id=notif_data.get("related_id")
    )
    db.add(db_notif)
    db.commit()
    db.refresh(db_notif)
    return db_notif


@router.put("/{notification_id}/read")
def mark_as_read(notification_id: int, user_id: int = 1, db: Session = Depends(get_db)):
    notification = db.query(NotificationModel).filter(
        NotificationModel.id == notification_id,
        NotificationModel.user_id == user_id
    ).first()
    if not notification:
        raise HTTPException(status_code=404, detail="通知不存在")
    
    notification.is_read = 1
    db.commit()
    db.refresh(notification)
    return notification


@router.put("/read-all")
def mark_all_as_read(user_id: int = 1, db: Session = Depends(get_db)):
    db.query(NotificationModel).filter(
        NotificationModel.user_id == user_id,
        NotificationModel.is_read == 0
    ).update({"is_read": 1})
    db.commit()
    return {"message": "全部已读"}
