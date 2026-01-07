from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from app.database import get_db
from app import models, schemas
from app.auth import get_current_active_user
from app.models import UserRole, BookingStatus, ServiceCategory

router = APIRouter()

def require_professional(current_user: models.User = Depends(get_current_active_user)):
    """Проверка прав мастера"""
    if current_user.role != UserRole.PROFESSIONAL:
        raise HTTPException(status_code=403, detail="Требуются права мастера")
    return current_user

# Статистика мастера
@router.get("/stats")
def get_professional_stats(
    current_user: models.User = Depends(require_professional),
    db: Session = Depends(get_db)
):
    """Получить статистику мастера"""
    total_services = db.query(models.Service).filter(
        models.Service.professional_id == current_user.id,
        models.Service.is_active == True
    ).count()
    
    total_bookings = db.query(models.Booking).filter(
        models.Booking.professional_id == current_user.id
    ).count()
    
    completed_bookings = db.query(models.Booking).filter(
        models.Booking.professional_id == current_user.id,
        models.Booking.status == BookingStatus.COMPLETED
    ).count()
    
    pending_bookings = db.query(models.Booking).filter(
        models.Booking.professional_id == current_user.id,
        models.Booking.status == BookingStatus.PENDING
    ).count()
    
    total_revenue = db.query(func.sum(models.Booking.total_price)).filter(
        models.Booking.professional_id == current_user.id,
        models.Booking.status == BookingStatus.COMPLETED
    ).scalar() or 0
    
    # Бронирования за последние 30 дней
    thirty_days_ago = datetime.now() - timedelta(days=30)
    recent_bookings = db.query(models.Booking).filter(
        models.Booking.professional_id == current_user.id,
        models.Booking.created_at >= thirty_days_ago
    ).count()
    
    # Средний рейтинг
    avg_rating = current_user.rating or 0
    total_reviews = current_user.total_reviews or 0
    
    return {
        "services": {
            "total": total_services
        },
        "bookings": {
            "total": total_bookings,
            "completed": completed_bookings,
            "pending": pending_bookings,
            "recent_30_days": recent_bookings
        },
        "revenue": {
            "total": float(total_revenue)
        },
        "rating": {
            "average": float(avg_rating),
            "total_reviews": total_reviews
        }
    }

# Управление услугами мастера
@router.get("/services", response_model=List[schemas.ServiceResponse])
def get_my_services(
    current_user: models.User = Depends(require_professional),
    db: Session = Depends(get_db)
):
    """Получить все услуги мастера"""
    services = db.query(models.Service).filter(
        models.Service.professional_id == current_user.id
    ).order_by(desc(models.Service.created_at)).all()
    return services

@router.post("/services", response_model=schemas.ServiceResponse)
def create_service(
    service: schemas.ServiceCreate,
    current_user: models.User = Depends(require_professional),
    db: Session = Depends(get_db)
):
    """Создать новую услугу"""
    db_service = models.Service(**service.dict(), professional_id=current_user.id)
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return db_service

@router.put("/services/{service_id}", response_model=schemas.ServiceResponse)
def update_my_service(
    service_id: int,
    service_update: schemas.ServiceUpdate,
    current_user: models.User = Depends(require_professional),
    db: Session = Depends(get_db)
):
    """Обновить услугу мастера"""
    db_service = db.query(models.Service).filter(
        models.Service.id == service_id,
        models.Service.professional_id == current_user.id
    ).first()
    
    if not db_service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    update_data = service_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_service, field, value)
    
    db.commit()
    db.refresh(db_service)
    return db_service

@router.delete("/services/{service_id}")
def delete_my_service(
    service_id: int,
    current_user: models.User = Depends(require_professional),
    db: Session = Depends(get_db)
):
    """Удалить услугу мастера"""
    db_service = db.query(models.Service).filter(
        models.Service.id == service_id,
        models.Service.professional_id == current_user.id
    ).first()
    
    if not db_service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    db_service.is_active = False
    db.commit()
    return {"message": "Service deactivated"}

# Бронирования мастера
@router.get("/bookings", response_model=List[schemas.BookingResponse])
def get_my_bookings(
    status: BookingStatus = None,
    current_user: models.User = Depends(require_professional),
    db: Session = Depends(get_db)
):
    """Получить бронирования мастера"""
    query = db.query(models.Booking).filter(
        models.Booking.professional_id == current_user.id
    )
    
    if status:
        query = query.filter(models.Booking.status == status)
    
    bookings = query.order_by(desc(models.Booking.booking_date)).all()
    return bookings

@router.put("/bookings/{booking_id}/status", response_model=schemas.BookingResponse)
def update_booking_status(
    booking_id: int,
    status: BookingStatus = Query(...),
    current_user: models.User = Depends(require_professional),
    db: Session = Depends(get_db)
):
    """Обновить статус бронирования"""
    booking = db.query(models.Booking).filter(
        models.Booking.id == booking_id,
        models.Booking.professional_id == current_user.id
    ).first()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    booking.status = status
    db.commit()
    db.refresh(booking)
    return booking

# Отзывы о мастере
@router.get("/reviews", response_model=List[schemas.ReviewResponse])
def get_my_reviews(
    current_user: models.User = Depends(require_professional),
    db: Session = Depends(get_db)
):
    """Получить отзывы о мастере"""
    reviews = db.query(models.Review).filter(
        models.Review.professional_id == current_user.id
    ).order_by(desc(models.Review.created_at)).all()
    return reviews

