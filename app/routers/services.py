from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import get_current_active_user
from app.models import ServiceCategory, UserRole

router = APIRouter()

@router.get("/", response_model=List[schemas.ServiceResponse])
def read_services(
    skip: int = 0,
    limit: int = 100,
    category: ServiceCategory = None,
    professional_id: int = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Service).filter(models.Service.is_active == True)
    
    if category:
        query = query.filter(models.Service.category == category)
    
    if professional_id:
        query = query.filter(models.Service.professional_id == professional_id)
    
    services = query.offset(skip).limit(limit).all()
    return services

@router.get("/categories")
def get_categories():
    return [{"value": cat.value, "name": cat.name} for cat in ServiceCategory]

@router.get("/{service_id}", response_model=schemas.ServiceResponse)
def read_service(service_id: int, db: Session = Depends(get_db)):
    service = db.query(models.Service).filter(models.Service.id == service_id).first()
    if service is None:
        raise HTTPException(status_code=404, detail="Service not found")
    return service

@router.post("/", response_model=schemas.ServiceResponse)
def create_service(
    service: schemas.ServiceCreate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if current_user.role != UserRole.PROFESSIONAL:
        raise HTTPException(status_code=403, detail="Only professionals can create services")
    
    db_service = models.Service(**service.dict(), professional_id=current_user.id)
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return db_service

@router.put("/{service_id}", response_model=schemas.ServiceResponse)
def update_service(
    service_id: int,
    service_update: schemas.ServiceUpdate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    db_service = db.query(models.Service).filter(models.Service.id == service_id).first()
    if db_service is None:
        raise HTTPException(status_code=404, detail="Service not found")
    
    if db_service.professional_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    update_data = service_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_service, field, value)
    
    db.commit()
    db.refresh(db_service)
    return db_service

@router.delete("/{service_id}")
def delete_service(
    service_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    db_service = db.query(models.Service).filter(models.Service.id == service_id).first()
    if db_service is None:
        raise HTTPException(status_code=404, detail="Service not found")
    
    if db_service.professional_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    db_service.is_active = False
    db.commit()
    return {"message": "Service deactivated"}

