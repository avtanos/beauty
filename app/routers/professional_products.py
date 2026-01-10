from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import get_current_active_user
from app.models import UserRole, ProductOrderStatus

router = APIRouter()

def require_professional(current_user: models.User = Depends(get_current_active_user)):
    """Проверка прав мастера"""
    if current_user.role != UserRole.PROFESSIONAL:
        raise HTTPException(status_code=403, detail="Требуются права мастера")
    return current_user

@router.get("/products", response_model=List[schemas.ProductResponse])
def get_my_products(
    current_user: models.User = Depends(require_professional),
    db: Session = Depends(get_db)
):
    """Получить мои товары"""
    products = db.query(models.Product).filter(
        models.Product.seller_id == current_user.id
    ).order_by(models.Product.created_at.desc()).all()
    
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

@router.post("/products", response_model=schemas.ProductResponse)
def create_product(
    product: schemas.ProductCreate,
    current_user: models.User = Depends(require_professional),
    db: Session = Depends(get_db)
):
    """Создать товар"""
    product_data = product.dict()
    image_urls = product_data.pop("image_urls", [])
    
    db_product = models.Product(
        seller_id=current_user.id,
        **product_data
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    
    # Добавляем изображения
    for idx, image_url in enumerate(image_urls):
        db_image = models.ProductImage(
            product_id=db_product.id,
            image_url=image_url,
            sort_order=idx
        )
        db.add(db_image)
    db.commit()
    
    return db_product

@router.put("/products/{product_id}", response_model=schemas.ProductResponse)
def update_product(
    product_id: int,
    product_update: schemas.ProductUpdate,
    current_user: models.User = Depends(require_professional),
    db: Session = Depends(get_db)
):
    """Обновить товар"""
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if db_product.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only seller can update product")
    
    update_data = product_update.dict(exclude_unset=True)
    image_urls = update_data.pop("image_urls", None)
    
    for field, value in update_data.items():
        if hasattr(db_product, field):
            setattr(db_product, field, value)
    
    # Обновляем изображения
    if image_urls is not None:
        # Удаляем старые изображения
        db.query(models.ProductImage).filter(
            models.ProductImage.product_id == product_id
        ).delete()
        # Добавляем новые
        for idx, image_url in enumerate(image_urls):
            db_image = models.ProductImage(
                product_id=product_id,
                image_url=image_url,
                sort_order=idx
            )
            db.add(db_image)
    
    db.commit()
    db.refresh(db_product)
    return db_product

@router.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    current_user: models.User = Depends(require_professional),
    db: Session = Depends(get_db)
):
    """Удалить товар (деактивация)"""
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if db_product.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only seller can delete product")
    
    db_product.is_active = False
    db.commit()
    return {"message": "Product deactivated"}

@router.get("/orders", response_model=List[schemas.ProductOrderResponse])
def get_my_orders(
    status: Optional[ProductOrderStatus] = Query(None),
    current_user: models.User = Depends(require_professional),
    db: Session = Depends(get_db)
):
    """Получить заказы продавца"""
    query = db.query(models.ProductOrder).filter(
        models.ProductOrder.seller_id == current_user.id
    )
    
    if status:
        query = query.filter(models.ProductOrder.status == status)
    
    orders = query.order_by(models.ProductOrder.created_at.desc()).all()
    
    result = []
    for order in orders:
        order_dict = schemas.ProductOrderResponse.model_validate(order).model_dump()
        # Загружаем товары
        items = db.query(models.ProductOrderItem).filter(
            models.ProductOrderItem.order_id == order.id
        ).all()
        order_dict["items"] = [schemas.ProductOrderItemResponse.model_validate(item).model_dump() for item in items]
        result.append(order_dict)
    
    return result

@router.put("/orders/{order_id}/status")
def update_order_status(
    order_id: int,
    status: ProductOrderStatus = Query(...),
    current_user: models.User = Depends(require_professional),
    db: Session = Depends(get_db)
):
    """Обновить статус заказа"""
    db_order = db.query(models.ProductOrder).filter(models.ProductOrder.id == order_id).first()
    
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if db_order.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only seller can update order")
    
    db_order.status = status
    db.commit()
    return {"message": "Order status updated"}
