from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import get_current_active_user
from app.models import UserRole

router = APIRouter()

def require_admin(current_user: models.User = Depends(get_current_active_user)):
    """Проверка прав администратора"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Требуются права администратора")
    return current_user

@router.get("/products", response_model=List[schemas.ProductResponse])
def get_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Получить все товары для модерации"""
    products = db.query(models.Product).order_by(models.Product.created_at.desc()).offset(skip).limit(limit).all()
    
    result = []
    for product in products:
        product_dict = schemas.ProductResponse.model_validate(product).model_dump()
        # Загружаем изображения
        images = db.query(models.ProductImage).filter(
            models.ProductImage.product_id == product.id
        ).order_by(models.ProductImage.sort_order).all()
        product_dict["images"] = [schemas.ProductImageResponse.model_validate(img).model_dump() for img in images]
        result.append(product_dict)
    
    return result

@router.post("/products/{product_id}/activate")
def activate_product(
    product_id: int,
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Активировать товар"""
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.is_active = True
    db.commit()
    return {"message": "Product activated"}

@router.post("/products/{product_id}/deactivate")
def deactivate_product(
    product_id: int,
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Деактивировать товар"""
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.is_active = False
    db.commit()
    return {"message": "Product deactivated"}

@router.get("/categories", response_model=List[schemas.ProductCategoryResponse])
def get_categories(
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Получить все категории товаров"""
    categories = db.query(models.ProductCategory).all()
    return categories

@router.post("/categories", response_model=schemas.ProductCategoryResponse)
def create_category(
    category: schemas.ProductCategoryCreate,
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Создать категорию товаров"""
    db_category = models.ProductCategory(**category.dict())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@router.put("/categories/{category_id}", response_model=schemas.ProductCategoryResponse)
def update_category(
    category_id: int,
    category_update: dict,
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Обновить категорию"""
    db_category = db.query(models.ProductCategory).filter(
        models.ProductCategory.id == category_id
    ).first()
    
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    for field, value in category_update.items():
        if hasattr(db_category, field):
            setattr(db_category, field, value)
    
    db.commit()
    db.refresh(db_category)
    return db_category
