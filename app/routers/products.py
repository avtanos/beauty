from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.models import ProductOrderStatus

router = APIRouter()

@router.get("/categories", response_model=List[schemas.ProductCategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    """Получить все активные категории товаров"""
    categories = db.query(models.ProductCategory).filter(
        models.ProductCategory.is_active == True
    ).all()
    return categories

@router.get("/products", response_model=List[schemas.ProductResponse])
def get_products(
    category_id: Optional[int] = Query(None),
    seller_id: Optional[int] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    search: Optional[str] = Query(None),
    in_stock: Optional[bool] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Получить каталог товаров"""
    query = db.query(models.Product).filter(models.Product.is_active == True)
    
    if category_id:
        query = query.filter(models.Product.category_id == category_id)
    
    if seller_id:
        query = query.filter(models.Product.seller_id == seller_id)
    
    if min_price:
        query = query.filter(models.Product.price >= min_price)
    
    if max_price:
        query = query.filter(models.Product.price <= max_price)
    
    if search:
        query = query.filter(
            (models.Product.name.contains(search)) |
            (models.Product.name_ru.contains(search)) |
            (models.Product.name_ky.contains(search))
        )
    
    if in_stock:
        if in_stock:
            query = query.filter(
                (models.Product.stock_qty.is_(None)) |
                (models.Product.stock_qty > 0)
            )
        else:
            query = query.filter(
                (models.Product.stock_qty.isnot(None)) &
                (models.Product.stock_qty == 0)
            )
    
    products = query.order_by(models.Product.created_at.desc()).offset(skip).limit(limit).all()
    
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

@router.get("/products/{product_id}", response_model=schemas.ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """Получить детали товара"""
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if not product.is_active:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product_dict = schemas.ProductResponse.model_validate(product).model_dump()
    # Загружаем изображения
    images = db.query(models.ProductImage).filter(
        models.ProductImage.product_id == product.id
    ).order_by(models.ProductImage.sort_order).all()
    product_dict["images"] = [schemas.ProductImageResponse.model_validate(img).model_dump() for img in images]
    
    return product_dict

@router.get("/sellers", response_model=List[schemas.UserResponse])
def get_sellers(db: Session = Depends(get_db)):
    """Получить список продавцов"""
    sellers = db.query(models.User).join(models.Product).filter(
        models.Product.is_active == True
    ).distinct().all()
    return sellers
