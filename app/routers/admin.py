from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from app.database import get_db
from app import models, schemas
from app.auth import get_current_active_user
from app.models import UserRole, BookingStatus, ServiceCategory

router = APIRouter()

def require_admin(current_user: models.User = Depends(get_current_active_user)):
    """Проверка прав администратора"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Требуются права администратора")
    return current_user

# Статистика
@router.get("/stats")
def get_statistics(
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Получить общую статистику системы"""
    total_users = db.query(models.User).count()
    total_clients = db.query(models.User).filter(models.User.role == UserRole.CLIENT).count()
    total_professionals = db.query(models.User).filter(models.User.role == UserRole.PROFESSIONAL).count()
    total_services = db.query(models.Service).filter(models.Service.is_active == True).count()
    total_bookings = db.query(models.Booking).count()
    total_reviews = db.query(models.Review).count()
    
    # Статистика по статусам бронирований
    bookings_by_status = db.query(
        models.Booking.status,
        func.count(models.Booking.id).label('count')
    ).group_by(models.Booking.status).all()
    
    # Доходы (сумма завершенных бронирований)
    total_revenue = db.query(func.sum(models.Booking.total_price)).filter(
        models.Booking.status == BookingStatus.COMPLETED
    ).scalar() or 0
    
    # Бронирования за последние 30 дней
    thirty_days_ago = datetime.now() - timedelta(days=30)
    recent_bookings = db.query(models.Booking).filter(
        models.Booking.created_at >= thirty_days_ago
    ).count()
    
    # Средний рейтинг мастеров
    avg_rating = db.query(func.avg(models.User.rating)).filter(
        models.User.role == UserRole.PROFESSIONAL,
        models.User.rating > 0
    ).scalar() or 0
    
    return {
        "users": {
            "total": total_users,
            "clients": total_clients,
            "professionals": total_professionals
        },
        "services": {
            "total": total_services
        },
        "bookings": {
            "total": total_bookings,
            "by_status": {status.value: count for status, count in bookings_by_status},
            "recent_30_days": recent_bookings
        },
        "reviews": {
            "total": total_reviews
        },
        "revenue": {
            "total": float(total_revenue)
        },
        "average_rating": float(avg_rating)
    }

# Управление пользователями
@router.get("/users", response_model=List[schemas.UserResponse])
def get_all_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    role: Optional[UserRole] = None,
    search: Optional[str] = None,
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Получить всех пользователей с фильтрацией"""
    query = db.query(models.User)
    
    if role:
        query = query.filter(models.User.role == role)
    
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (models.User.full_name.ilike(search_filter)) |
            (models.User.email.ilike(search_filter)) |
            (models.User.phone.ilike(search_filter))
        )
    
    users = query.order_by(desc(models.User.created_at)).offset(skip).limit(limit).all()
    return users

@router.get("/users/{user_id}", response_model=schemas.UserResponse)
def get_user(
    user_id: int,
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Получить пользователя по ID"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/users/{user_id}", response_model=schemas.UserResponse)
def update_user(
    user_id: int,
    user_update: schemas.UserUpdate,
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Обновить пользователя"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = user_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    return user

@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Деактивировать пользователя"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate yourself")
    
    user.is_active = False
    db.commit()
    return {"message": "User deactivated"}

@router.post("/users/{user_id}/activate")
def activate_user(
    user_id: int,
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Активировать пользователя"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = True
    db.commit()
    return {"message": "User activated"}

# Управление услугами
@router.get("/services", response_model=List[schemas.ServiceResponse])
def get_all_services(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    category: Optional[ServiceCategory] = None,
    professional_id: Optional[int] = None,
    is_active: Optional[bool] = None,
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Получить все услуги"""
    query = db.query(models.Service)
    
    if category:
        query = query.filter(models.Service.category == category)
    
    if professional_id:
        query = query.filter(models.Service.professional_id == professional_id)
    
    if is_active is not None:
        query = query.filter(models.Service.is_active == is_active)
    
    services = query.order_by(desc(models.Service.created_at)).offset(skip).limit(limit).all()
    return services

@router.delete("/services/{service_id}")
def delete_service(
    service_id: int,
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Удалить услугу"""
    service = db.query(models.Service).filter(models.Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    service.is_active = False
    db.commit()
    return {"message": "Service deactivated"}

@router.post("/services/{service_id}/activate")
def activate_service(
    service_id: int,
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Активировать услугу"""
    service = db.query(models.Service).filter(models.Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    service.is_active = True
    db.commit()
    return {"message": "Service activated"}

# Управление бронированиями
@router.get("/bookings", response_model=List[schemas.BookingResponse])
def get_all_bookings(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[BookingStatus] = None,
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Получить все бронирования"""
    query = db.query(models.Booking)
    
    if status:
        query = query.filter(models.Booking.status == status)
    
    bookings = query.order_by(desc(models.Booking.created_at)).offset(skip).limit(limit).all()
    return bookings

@router.put("/bookings/{booking_id}", response_model=schemas.BookingResponse)
def update_booking(
    booking_id: int,
    booking_update: schemas.BookingUpdate,
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Обновить бронирование"""
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    update_data = booking_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(booking, field, value)
    
    db.commit()
    db.refresh(booking)
    return booking

# Управление отзывами
@router.get("/reviews", response_model=List[schemas.ReviewResponse])
def get_all_reviews(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    professional_id: Optional[int] = None,
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Получить все отзывы"""
    query = db.query(models.Review)
    
    if professional_id:
        query = query.filter(models.Review.professional_id == professional_id)
    
    reviews = query.order_by(desc(models.Review.created_at)).offset(skip).limit(limit).all()
    return reviews

@router.delete("/reviews/{review_id}")
def delete_review(
    review_id: int,
    current_user: models.User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Удалить отзыв"""
    review = db.query(models.Review).filter(models.Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    # Обновляем рейтинг мастера
    professional = db.query(models.User).filter(models.User.id == review.professional_id).first()
    if professional:
        reviews = db.query(models.Review).filter(models.Review.professional_id == professional.id).all()
        if len(reviews) > 1:
            total_rating = sum(r.rating for r in reviews if r.id != review_id)
            professional.total_reviews = len(reviews) - 1
            professional.rating = total_rating / professional.total_reviews if professional.total_reviews > 0 else 0
        else:
            professional.rating = 0
            professional.total_reviews = 0
    
    db.delete(review)
    db.commit()
    return {"message": "Review deleted"}

