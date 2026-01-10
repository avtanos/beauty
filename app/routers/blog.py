from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import get_current_active_user, get_current_user_optional
from app.models import UserRole, BlogPostStatus

router = APIRouter()

# Public endpoints
@router.get("/categories", response_model=List[schemas.BlogCategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    """Получить все активные категории блога"""
    categories = db.query(models.BlogCategory).filter(
        models.BlogCategory.is_active == True
    ).all()
    return categories

@router.get("/tags", response_model=List[schemas.BlogTagResponse])
def get_tags(db: Session = Depends(get_db)):
    """Получить все теги"""
    tags = db.query(models.BlogTag).all()
    return tags

@router.get("/posts", response_model=List[schemas.BlogPostResponse])
def get_posts(
    category_id: Optional[int] = Query(None),
    tag_id: Optional[int] = Query(None),
    author_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    status: Optional[BlogPostStatus] = Query(BlogPostStatus.PUBLISHED),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user_optional)
):
    """Получить список постов блога"""
    query = db.query(models.BlogPost)
    
    # Фильтр по статусу: только опубликованные для неавторизованных, или все для автора/админа
    if current_user is None or current_user.role != UserRole.ADMIN:
        if author_id and current_user and current_user.id == author_id:
            # Автор может видеть свои посты в любом статусе
            pass
        else:
            query = query.filter(models.BlogPost.status == BlogPostStatus.PUBLISHED)
    elif status:
        query = query.filter(models.BlogPost.status == status)
    
    if category_id:
        query = query.filter(models.BlogPost.category_id == category_id)
    
    if author_id:
        query = query.filter(models.BlogPost.author_id == author_id)
    
    if search:
        query = query.filter(
            (models.BlogPost.title.contains(search)) |
            (models.BlogPost.title_ru.contains(search)) |
            (models.BlogPost.title_ky.contains(search))
        )
    
    if tag_id:
        query = query.join(models.BlogPostTag).filter(
            models.BlogPostTag.tag_id == tag_id
        )
    
    posts = query.order_by(models.BlogPost.published_at.desc(), models.BlogPost.created_at.desc()).offset(skip).limit(limit).all()
    
    # Загружаем связанные данные
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

@router.get("/posts/{post_id}", response_model=schemas.BlogPostResponse)
def get_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user_optional)
):
    """Получить детали поста"""
    post = db.query(models.BlogPost).filter(models.BlogPost.id == post_id).first()
    
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Проверка прав доступа
    if post.status != BlogPostStatus.PUBLISHED:
        if not current_user:
            raise HTTPException(status_code=403, detail="Access denied")
        if current_user.role != UserRole.ADMIN and current_user.id != post.author_id:
            raise HTTPException(status_code=403, detail="Access denied")
    
    post_dict = schemas.BlogPostResponse.model_validate(post).model_dump()
    # Загружаем теги
    post_tags = db.query(models.BlogTag).join(models.BlogPostTag).filter(
        models.BlogPostTag.post_id == post.id
    ).all()
    post_dict["tags"] = [schemas.BlogTagResponse.model_validate(tag).model_dump() for tag in post_tags]
    
    return post_dict

# Authenticated endpoints
@router.post("/posts", response_model=schemas.BlogPostResponse)
def create_post(
    post: schemas.BlogPostCreate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Создать новый пост (черновик)"""
    if current_user.role not in [UserRole.CLIENT, UserRole.PROFESSIONAL]:
        raise HTTPException(status_code=403, detail="Only clients and professionals can create posts")
    
    db_post = models.BlogPost(
        author_id=current_user.id,
        title=post.title,
        title_ru=post.title_ru,
        title_ky=post.title_ky,
        content=post.content,
        cover_image_url=post.cover_image_url,
        category_id=post.category_id,
        status=BlogPostStatus.DRAFT
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    
    # Добавляем теги
    if post.tag_ids:
        for tag_id in post.tag_ids:
            tag = db.query(models.BlogTag).filter(models.BlogTag.id == tag_id).first()
            if tag:
                post_tag = models.BlogPostTag(post_id=db_post.id, tag_id=tag_id)
                db.add(post_tag)
        db.commit()
    
    return db_post

@router.put("/posts/{post_id}", response_model=schemas.BlogPostResponse)
def update_post(
    post_id: int,
    post_update: schemas.BlogPostUpdate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Редактировать пост (только автор)"""
    db_post = db.query(models.BlogPost).filter(models.BlogPost.id == post_id).first()
    
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if db_post.author_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only author can edit post")
    
    # Обновляем поля
    update_data = post_update.dict(exclude_unset=True)
    tag_ids = update_data.pop("tag_ids", None)
    
    for field, value in update_data.items():
        if hasattr(db_post, field):
            setattr(db_post, field, value)
    
    # Обновляем теги
    if tag_ids is not None:
        # Удаляем старые связи
        db.query(models.BlogPostTag).filter(models.BlogPostTag.post_id == post_id).delete()
        # Добавляем новые
        for tag_id in tag_ids:
            tag = db.query(models.BlogTag).filter(models.BlogTag.id == tag_id).first()
            if tag:
                post_tag = models.BlogPostTag(post_id=post_id, tag_id=tag_id)
                db.add(post_tag)
    
    db.commit()
    db.refresh(db_post)
    return db_post

@router.post("/posts/{post_id}/submit")
def submit_post(
    post_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Отправить пост на модерацию"""
    db_post = db.query(models.BlogPost).filter(models.BlogPost.id == post_id).first()
    
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if db_post.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only author can submit post")
    
    if db_post.status not in [BlogPostStatus.DRAFT, BlogPostStatus.REJECTED]:
        raise HTTPException(status_code=400, detail="Post can only be submitted from draft or rejected status")
    
    db_post.status = BlogPostStatus.SUBMITTED
    db.commit()
    return {"message": "Post submitted for moderation"}

@router.delete("/posts/{post_id}")
def delete_post(
    post_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Удалить/архивировать пост"""
    db_post = db.query(models.BlogPost).filter(models.BlogPost.id == post_id).first()
    
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if db_post.author_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only author can delete post")
    
    # Архивируем вместо удаления
    db_post.status = BlogPostStatus.ARCHIVED
    db.commit()
    return {"message": "Post archived"}
