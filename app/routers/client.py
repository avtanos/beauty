from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from app.database import get_db
from app import models, schemas
from app.auth import get_current_active_user
from app.models import UserRole, BookingStatus

router = APIRouter()

def require_client(current_user: models.User = Depends(get_current_active_user)):
    """Проверка прав клиента"""
    if current_user.role != UserRole.CLIENT:
        raise HTTPException(status_code=403, detail="Требуются права клиента")
    return current_user

# Статистика клиента
@router.get("/stats")
def get_client_stats(
    current_user: models.User = Depends(require_client),
    db: Session = Depends(get_db)
):
    """Получить статистику клиента"""
    total_bookings = db.query(models.Booking).filter(
        models.Booking.client_id == current_user.id
    ).count()
    
    completed_bookings = db.query(models.Booking).filter(
        models.Booking.client_id == current_user.id,
        models.Booking.status == BookingStatus.COMPLETED
    ).count()
    
    pending_bookings = db.query(models.Booking).filter(
        models.Booking.client_id == current_user.id,
        models.Booking.status == BookingStatus.PENDING
    ).count()
    
    total_spent = db.query(func.sum(models.Booking.total_price)).filter(
        models.Booking.client_id == current_user.id,
        models.Booking.status == BookingStatus.COMPLETED
    ).scalar() or 0
    
    # Бронирования за последние 30 дней
    thirty_days_ago = datetime.now() - timedelta(days=30)
    recent_bookings = db.query(models.Booking).filter(
        models.Booking.client_id == current_user.id,
        models.Booking.created_at >= thirty_days_ago
    ).count()
    
    total_reviews = db.query(models.Review).filter(
        models.Review.client_id == current_user.id
    ).count()
    
    return {
        "bookings": {
            "total": total_bookings,
            "completed": completed_bookings,
            "pending": pending_bookings,
            "recent_30_days": recent_bookings
        },
        "spending": {
            "total": float(total_spent)
        },
        "reviews": {
            "total": total_reviews
        }
    }

# Бронирования клиента
@router.get("/bookings", response_model=List[schemas.BookingResponse])
def get_my_bookings(
    status: BookingStatus = None,
    current_user: models.User = Depends(require_client),
    db: Session = Depends(get_db)
):
    """Получить бронирования клиента"""
    query = db.query(models.Booking).filter(
        models.Booking.client_id == current_user.id
    )
    
    if status:
        query = query.filter(models.Booking.status == status)
    
    bookings = query.order_by(desc(models.Booking.booking_date)).all()
    return bookings

@router.get("/bookings/{booking_id}", response_model=schemas.BookingResponse)
def get_my_booking(
    booking_id: int,
    current_user: models.User = Depends(require_client),
    db: Session = Depends(get_db)
):
    """Получить детали бронирования"""
    booking = db.query(models.Booking).filter(
        models.Booking.id == booking_id,
        models.Booking.client_id == current_user.id
    ).first()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    return booking

# Отзывы клиента
@router.get("/reviews", response_model=List[schemas.ReviewResponse])
def get_my_reviews(
    current_user: models.User = Depends(require_client),
    db: Session = Depends(get_db)
):
    """Получить отзывы клиента"""
    reviews = db.query(models.Review).filter(
        models.Review.client_id == current_user.id
    ).order_by(desc(models.Review.created_at)).all()
    return reviews

# Избранные мастера (можно расширить в будущем)
@router.get("/favorites/professionals", response_model=List[schemas.UserResponse])
def get_favorite_professionals(
    current_user: models.User = Depends(require_client),
    db: Session = Depends(get_db)
):
    """Получить избранных мастеров (пока возвращает всех с высоким рейтингом)"""
    professionals = db.query(models.User).filter(
        models.User.role == UserRole.PROFESSIONAL,
        models.User.rating >= 4.8,
        models.User.is_active == True
    ).order_by(desc(models.User.rating)).limit(10).all()
    return professionals

