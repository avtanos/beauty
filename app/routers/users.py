from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import get_current_active_user
from app.models import UserRole

router = APIRouter()

@router.get("/", response_model=List[schemas.UserResponse])
def read_users(
    skip: int = 0,
    limit: int = 100,
    role: UserRole = None,
    min_rating: float = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.User)
    
    if role:
        query = query.filter(models.User.role == role)
    
    if min_rating is not None:
        query = query.filter(models.User.rating >= min_rating)
    
    users = query.offset(skip).limit(limit).all()
    return users

@router.get("/professionals", response_model=List[schemas.UserResponse])
def read_professionals(
    skip: int = 0,
    limit: int = 100,
    min_rating: float = 4.8,
    db: Session = Depends(get_db)
):
    professionals = db.query(models.User).filter(
        models.User.role == UserRole.PROFESSIONAL,
        models.User.rating >= min_rating,
        models.User.is_active == True
    ).offset(skip).limit(limit).all()
    return professionals

@router.get("/{user_id}", response_model=schemas.UserResponse)
def read_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/me", response_model=schemas.UserResponse)
def update_user_me(
    user_update: schemas.UserUpdate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    update_data = user_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user

