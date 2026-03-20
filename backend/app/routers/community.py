from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Post as PostModel, Comment as CommentModel, Like as LikeModel, Pet as PetModel

router = APIRouter(prefix="/api/posts", tags=["社区"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("")
def get_posts(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    posts = db.query(PostModel).order_by(PostModel.created_at.desc()).offset(skip).limit(limit).all()
    total = db.query(PostModel).count()
    return {"items": posts, "total": total, "page": skip // limit + 1, "pageSize": limit}


@router.get("/{post_id}")
def get_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(PostModel).filter(PostModel.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="帖子不存在")
    return post


@router.post("")
def create_post(post_data: dict, user_id: int = 1, username: str = "用户", db: Session = Depends(get_db)):
    db_post = PostModel(
        user_id=user_id,
        username=username,
        title=post_data["title"],
        content=post_data.get("content", ""),
        image_urls=post_data.get("image_urls", "")
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post


@router.delete("/{post_id}")
def delete_post(post_id: int, user_id: int = 1, db: Session = Depends(get_db)):
    post = db.query(PostModel).filter(PostModel.id == post_id, PostModel.user_id == user_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="帖子不存在或无权删除")
    
    db.query(CommentModel).filter(CommentModel.post_id == post_id).delete()
    db.query(LikeModel).filter(LikeModel.post_id == post_id).delete()
    db.delete(post)
    db.commit()
    return {"message": "删除成功"}


@router.post("/{post_id}/like")
def toggle_like(post_id: int, user_id: int = 1, db: Session = Depends(get_db)):
    post = db.query(PostModel).filter(PostModel.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="帖子不存在")
    
    existing = db.query(LikeModel).filter(LikeModel.post_id == post_id, LikeModel.user_id == user_id).first()
    
    if existing:
        db.delete(existing)
        post.likes_count = max(0, post.likes_count - 1)
        liked = False
    else:
        db_like = LikeModel(post_id=post_id, user_id=user_id)
        db.add(db_like)
        post.likes_count += 1
        liked = True
    
    db.commit()
    db.refresh(post)
    return {"liked": liked, "likes_count": post.likes_count}


@router.get("/{post_id}/comments")
def get_comments(post_id: int, db: Session = Depends(get_db)):
    comments = db.query(CommentModel).filter(CommentModel.post_id == post_id).order_by(CommentModel.created_at.asc()).all()
    return comments


@router.post("/{post_id}/comments")
def create_comment(post_id: int, comment_data: dict, user_id: int = 1, username: str = "用户", db: Session = Depends(get_db)):
    post = db.query(PostModel).filter(PostModel.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="帖子不存在")
    
    db_comment = CommentModel(
        post_id=post_id,
        user_id=user_id,
        username=username,
        content=comment_data["content"]
    )
    db.add(db_comment)
    post.comments_count += 1
    db.commit()
    db.refresh(db_comment)
    return db_comment


@router.delete("/comments/{comment_id}")
def delete_comment(comment_id: int, user_id: int = 1, db: Session = Depends(get_db)):
    comment = db.query(CommentModel).filter(CommentModel.id == comment_id, CommentModel.user_id == user_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="评论不存在或无权删除")
    
    post = db.query(PostModel).filter(PostModel.id == comment.post_id).first()
    if post:
        post.comments_count = max(0, post.comments_count - 1)
    
    db.delete(comment)
    db.commit()
    return {"message": "删除成功"}
