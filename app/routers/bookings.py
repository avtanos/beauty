from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import get_current_active_user
from app.models import BookingStatus, UserRole

router = APIRouter()

@router.get("/", response_model=List[schemas.BookingResponse])
def read_bookings(
    skip: int = 0,
    limit: int = 100,
    status: BookingStatus = None,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    query = db.query(models.Booking)
    
    if current_user.role == UserRole.CLIENT:
        query = query.filter(models.Booking.client_id == current_user.id)
    elif current_user.role == UserRole.PROFESSIONAL:
        query = query.filter(models.Booking.professional_id == current_user.id)
    
    if status:
        query = query.filter(models.Booking.status == status)
    
    bookings = query.offset(skip).limit(limit).all()
    return bookings

@router.get("/{booking_id}", response_model=schemas.BookingResponse)
def read_booking(
    booking_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if booking is None:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if (current_user.role == UserRole.CLIENT and booking.client_id != current_user.id) or \
       (current_user.role == UserRole.PROFESSIONAL and booking.professional_id != current_user.id):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return booking

@router.post("/", response_model=schemas.BookingResponse)
def create_booking(
    booking: schemas.BookingCreate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Get service to get price and professional
    service = db.query(models.Service).filter(models.Service.id == booking.service_id).first()
    if service is None:
        raise HTTPException(status_code=404, detail="Service not found")
    
    if not service.is_active:
        raise HTTPException(status_code=400, detail="Service is not available")
    
    # Check if professional is active
    professional = db.query(models.User).filter(models.User.id == service.professional_id).first()
    if not professional or not professional.is_active:
        raise HTTPException(status_code=400, detail="Professional is not available")
    
    # Create booking
    db_booking = models.Booking(
        **booking.dict(),
        client_id=current_user.id,
        professional_id=service.professional_id,
        total_price=service.price,
        status=BookingStatus.PENDING
    )
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking

@router.put("/{booking_id}", response_model=schemas.BookingResponse)
def update_booking(
    booking_id: int,
    booking_update: schemas.BookingUpdate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    db_booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if db_booking is None:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Check permissions
    if current_user.role == UserRole.CLIENT and db_booking.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    elif current_user.role == UserRole.PROFESSIONAL and db_booking.professional_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    update_data = booking_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_booking, field, value)
    
    db.commit()
    db.refresh(db_booking)
    return db_booking

@router.post("/{booking_id}/cancel")
def cancel_booking(
    booking_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    db_booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if db_booking is None:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if db_booking.status == BookingStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Cannot cancel completed booking")
    
    if db_booking.status == BookingStatus.CANCELLED:
        raise HTTPException(status_code=400, detail="Booking already cancelled")
    
    db_booking.status = BookingStatus.CANCELLED
    db.commit()
    return {"message": "Booking cancelled"}

