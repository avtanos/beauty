from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import get_current_active_user
from app.models import UserRole, NewsItemStatus

router = APIRouter()

def require_admin(current_user: models.User = Depends(get_current_active_user)):
    """Проверка прав администратора"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Требуются права администратора")
    return current_user

# Source management
@router.get("/sources", response_model=List[schemas.NewsSourceResponse])
def get_sources(
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Получить все источники"""
    sources = db.query(models.NewsSource).all()
    return sources

@router.post("/sources", response_model=schemas.NewsSourceResponse)
def create_source(
    source: schemas.NewsSourceCreate,
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Создать источник новостей"""
    db_source = models.NewsSource(**source.dict())
    db.add(db_source)
    db.commit()
    db.refresh(db_source)
    return db_source

@router.put("/sources/{source_id}", response_model=schemas.NewsSourceResponse)
def update_source(
    source_id: int,
    source_update: schemas.NewsSourceUpdate,
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Обновить источник"""
    db_source = db.query(models.NewsSource).filter(
        models.NewsSource.id == source_id
    ).first()
    
    if not db_source:
        raise HTTPException(status_code=404, detail="Source not found")
    
    update_data = source_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(db_source, field):
            setattr(db_source, field, value)
    
    db.commit()
    db.refresh(db_source)
    return db_source

@router.post("/sources/{source_id}/activate")
def activate_source(
    source_id: int,
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Активировать источник"""
    source = db.query(models.NewsSource).filter(models.NewsSource.id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
    source.is_active = True
    db.commit()
    return {"message": "Source activated"}

@router.post("/sources/{source_id}/deactivate")
def deactivate_source(
    source_id: int,
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Деактивировать источник"""
    source = db.query(models.NewsSource).filter(models.NewsSource.id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
    source.is_active = False
    db.commit()
    return {"message": "Source deactivated"}

# Category management
@router.get("/categories", response_model=List[schemas.NewsCategoryResponse])
def get_categories(
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Получить все категории"""
    categories = db.query(models.NewsCategory).all()
    return categories

@router.post("/categories", response_model=schemas.NewsCategoryResponse)
def create_category(
    category: schemas.NewsCategoryCreate,
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Создать категорию"""
    db_category = models.NewsCategory(**category.dict())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

# Item management
@router.get("/items", response_model=List[schemas.NewsItemResponse])
def get_items(
    status: Optional[NewsItemStatus] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Получить новости для управления"""
    query = db.query(models.NewsItem)
    
    if status:
        query = query.filter(models.NewsItem.status == status)
    
    items = query.order_by(models.NewsItem.created_at.desc()).offset(skip).limit(limit).all()
    return items

@router.post("/items/{item_id}/hide")
def hide_item(
    item_id: int,
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Скрыть новость"""
    item = db.query(models.NewsItem).filter(models.NewsItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    item.status = NewsItemStatus.HIDDEN
    db.commit()
    return {"message": "Item hidden"}

@router.post("/items/{item_id}/unhide")
def unhide_item(
    item_id: int,
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Показать новость"""
    item = db.query(models.NewsItem).filter(models.NewsItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    item.status = NewsItemStatus.ACTIVE
    db.commit()
    return {"message": "Item unhidden"}

@router.post("/fetch")
def manual_fetch(
    source_id: Optional[int] = Query(None),
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Ручной запуск обновления новостей (для разработки/демо)"""
    # TODO: Реализовать парсинг RSS/HTML
    return {"message": "Fetch functionality will be implemented"}
