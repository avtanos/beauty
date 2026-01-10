from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import get_current_active_user
from app.models import UserRole, ProductOrderStatus

router = APIRouter()

@router.post("/orders", response_model=schemas.ProductOrderResponse)
def create_order(
    order: schemas.ProductOrderCreate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Создать заказ товара"""
    if current_user.role != UserRole.CLIENT:
        raise HTTPException(status_code=403, detail="Only clients can create orders")
    
    # Проверяем товары и считаем общую стоимость
    total_price = 0.0
    order_items = []
    
    for item in order.items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        
        if not product.is_active:
            raise HTTPException(status_code=400, detail=f"Product {item.product_id} is not available")
        
        if product.seller_id != order.seller_id:
            raise HTTPException(status_code=400, detail=f"Product {item.product_id} belongs to different seller")
        
        # Проверяем наличие
        if product.stock_qty is not None and product.stock_qty < item.qty:
            raise HTTPException(status_code=400, detail=f"Not enough stock for product {item.product_id}")
        
        total_price += product.price * item.qty
        order_items.append({
            "product": product,
            "qty": item.qty,
            "unit_price": product.price
        })
    
    # Создаем заказ
    db_order = models.ProductOrder(
        client_id=current_user.id,
        seller_id=order.seller_id,
        status=ProductOrderStatus.PENDING,
        total_price=total_price,
        address=order.address,
        phone=order.phone,
        notes=order.notes
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    
    # Создаем позиции заказа
    for item_data in order_items:
        db_item = models.ProductOrderItem(
            order_id=db_order.id,
            product_id=item_data["product"].id,
            qty=item_data["qty"],
            unit_price=item_data["unit_price"]
        )
        db.add(db_item)
        
        # Уменьшаем остаток товара
        if item_data["product"].stock_qty is not None:
            item_data["product"].stock_qty -= item_data["qty"]
    
    db.commit()
    db.refresh(db_order)
    
    # Загружаем связанные данные для ответа
    order_dict = schemas.ProductOrderResponse.model_validate(db_order).model_dump()
    items = db.query(models.ProductOrderItem).filter(
        models.ProductOrderItem.order_id == db_order.id
    ).all()
    order_dict["items"] = [schemas.ProductOrderItemResponse.model_validate(item).model_dump() for item in items]
    
    return order_dict

@router.get("/orders", response_model=List[schemas.ProductOrderResponse])
def get_my_orders(
    status: Optional[ProductOrderStatus] = Query(None),
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Получить мои заказы (клиент)"""
    if current_user.role != UserRole.CLIENT:
        raise HTTPException(status_code=403, detail="Only clients can view their orders")
    
    query = db.query(models.ProductOrder).filter(
        models.ProductOrder.client_id == current_user.id
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
