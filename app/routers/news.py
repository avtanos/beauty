from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.models import NewsItemStatus

router = APIRouter()

@router.get("/categories", response_model=List[schemas.NewsCategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    """Получить все активные категории новостей"""
    categories = db.query(models.NewsCategory).filter(
        models.NewsCategory.is_active == True
    ).all()
    return categories

@router.get("/sources", response_model=List[schemas.NewsSourceResponse])
def get_sources(db: Session = Depends(get_db)):
    """Получить все активные источники"""
    sources = db.query(models.NewsSource).filter(
        models.NewsSource.is_active == True
    ).all()
    return sources

@router.get("/items", response_model=List[schemas.NewsItemResponse])
def get_items(
    category_id: Optional[int] = Query(None),
    source_id: Optional[int] = Query(None),
    language: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Получить ленту новостей"""
    query = db.query(models.NewsItem).filter(
        models.NewsItem.status == NewsItemStatus.ACTIVE
    )
    
    if category_id:
        query = query.filter(models.NewsItem.category_id == category_id)
    
    if source_id:
        query = query.filter(models.NewsItem.source_id == source_id)
    
    if language:
        query = query.join(models.NewsSource).filter(
            models.NewsSource.language == language
        )
    
    if search:
        query = query.filter(models.NewsItem.title.contains(search))
    
    items = query.order_by(
        models.NewsItem.published_at.desc(),
        models.NewsItem.created_at.desc()
    ).offset(skip).limit(limit).all()
    
    return items

@router.get("/items/{item_id}", response_model=schemas.NewsItemResponse)
def get_item(item_id: int, db: Session = Depends(get_db)):
    """Получить детали новости"""
    item = db.query(models.NewsItem).filter(models.NewsItem.id == item_id).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="News item not found")
    
    if item.status != NewsItemStatus.ACTIVE:
        raise HTTPException(status_code=404, detail="News item not found")
    
    return item
