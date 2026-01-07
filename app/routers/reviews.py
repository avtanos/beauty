from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app import models, schemas
from app.auth import get_current_active_user
from app.models import BookingStatus

router = APIRouter()

@router.get("/", response_model=List[schemas.ReviewResponse])
def read_reviews(
    skip: int = 0,
    limit: int = 100,
    professional_id: int = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Review)
    
    if professional_id:
        query = query.filter(models.Review.professional_id == professional_id)
    
    reviews = query.offset(skip).limit(limit).order_by(models.Review.created_at.desc()).all()
    return reviews

@router.get("/{review_id}", response_model=schemas.ReviewResponse)
def read_review(review_id: int, db: Session = Depends(get_db)):
    review = db.query(models.Review).filter(models.Review.id == review_id).first()
    if review is None:
        raise HTTPException(status_code=404, detail="Review not found")
    return review

@router.post("/", response_model=schemas.ReviewResponse)
def create_review(
    review: schemas.ReviewCreate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Check if booking exists and belongs to user
    booking = db.query(models.Booking).filter(models.Booking.id == review.booking_id).first()
    if booking is None:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if booking.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only review your own bookings")
    
    if booking.status != BookingStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Can only review completed bookings")
    
    # Check if review already exists
    existing_review = db.query(models.Review).filter(models.Review.booking_id == review.booking_id).first()
    if existing_review:
        raise HTTPException(status_code=400, detail="Review already exists for this booking")
    
    # Validate rating
    if review.rating < 1 or review.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    
    # Create review
    db_review = models.Review(
        **review.dict(),
        client_id=current_user.id,
        professional_id=booking.professional_id
    )
    db.add(db_review)
    
    # Update professional rating
    professional = db.query(models.User).filter(models.User.id == booking.professional_id).first()
    if professional:
        # Calculate new average rating
        reviews = db.query(models.Review).filter(models.Review.professional_id == professional.id).all()
        total_rating = sum(r.rating for r in reviews) + review.rating
        professional.total_reviews = len(reviews) + 1
        professional.rating = total_rating / professional.total_reviews
    
    db.commit()
    db.refresh(db_review)
    return db_review

