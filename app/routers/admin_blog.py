from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import get_current_active_user
from app.models import UserRole, BlogPostStatus

router = APIRouter()

def require_admin(current_user: models.User = Depends(get_current_active_user)):
    """Проверка прав администратора"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Требуются права администратора")
    return current_user

# Category management
@router.get("/categories", response_model=List[schemas.BlogCategoryResponse])
def get_categories(
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Получить все категории блога"""
    categories = db.query(models.BlogCategory).all()
    return categories

@router.post("/categories", response_model=schemas.BlogCategoryResponse)
def create_category(
    category: schemas.BlogCategoryCreate,
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Создать категорию"""
    db_category = models.BlogCategory(**category.dict())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@router.put("/categories/{category_id}", response_model=schemas.BlogCategoryResponse)
def update_category(
    category_id: int,
    category_update: dict,
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Обновить категорию"""
    db_category = db.query(models.BlogCategory).filter(
        models.BlogCategory.id == category_id
    ).first()
    
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    for field, value in category_update.items():
        if hasattr(db_category, field):
            setattr(db_category, field, value)
    
    db.commit()
    db.refresh(db_category)
    return db_category

# Tag management
@router.get("/tags", response_model=List[schemas.BlogTagResponse])
def get_tags(
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Получить все теги"""
    tags = db.query(models.BlogTag).all()
    return tags

@router.post("/tags", response_model=schemas.BlogTagResponse)
def create_tag(
    tag: schemas.BlogTagCreate,
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Создать тег"""
    # Проверяем, существует ли уже такой тег
    existing = db.query(models.BlogTag).filter(models.BlogTag.name == tag.name).first()
    if existing:
        return existing
    
    db_tag = models.BlogTag(**tag.dict())
    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)
    return db_tag

# Post moderation
@router.get("/posts", response_model=List[schemas.BlogPostResponse])
def get_posts(
    status: Optional[BlogPostStatus] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Получить посты для модерации"""
    query = db.query(models.BlogPost)
    
    if status:
        query = query.filter(models.BlogPost.status == status)
    
    posts = query.order_by(models.BlogPost.created_at.desc()).offset(skip).limit(limit).all()
    
    result = []
    for post in posts:
        post_dict = schemas.BlogPostResponse.model_validate(post).model_dump()
        # Загружаем теги
        post_tags = db.query(models.BlogTag).join(models.BlogPostTag).filter(
            models.BlogPostTag.post_id == post.id
        ).all()
        post_dict["tags"] = [schemas.BlogTagResponse.model_validate(tag).model_dump() for tag in post_tags]
        result.append(post_dict)
    
    return result

@router.post("/posts/{post_id}/publish")
def publish_post(
    post_id: int,
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Опубликовать пост"""
    db_post = db.query(models.BlogPost).filter(models.BlogPost.id == post_id).first()
    
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if db_post.status != BlogPostStatus.SUBMITTED:
        raise HTTPException(status_code=400, detail="Post must be in submitted status")
    
    from datetime import datetime, timezone
    db_post.status = BlogPostStatus.PUBLISHED
    db_post.published_at = datetime.now(timezone.utc)
    db.commit()
    
    return {"message": "Post published"}

@router.post("/posts/{post_id}/reject")
def reject_post(
    post_id: int,
    rejection_reason: str = Query(...),
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Отклонить пост"""
    db_post = db.query(models.BlogPost).filter(models.BlogPost.id == post_id).first()
    
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if db_post.status != BlogPostStatus.SUBMITTED:
        raise HTTPException(status_code=400, detail="Post must be in submitted status")
    
    db_post.status = BlogPostStatus.REJECTED
    db_post.rejection_reason = rejection_reason
    db.commit()
    
    return {"message": "Post rejected"}

@router.post("/posts/{post_id}/archive")
def archive_post(
    post_id: int,
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Архивировать пост"""
    db_post = db.query(models.BlogPost).filter(models.BlogPost.id == post_id).first()
    
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    db_post.status = BlogPostStatus.ARCHIVED
    db.commit()
    
    return {"message": "Post archived"}
