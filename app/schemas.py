from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from app.models import UserRole, BookingStatus, ServiceCategory

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    phone: str
    full_name: str

class UserCreate(UserBase):
    password: str
    role: Optional[UserRole] = UserRole.CLIENT

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    experience_years: Optional[int] = None
    profile_image: Optional[str] = None

class UserResponse(UserBase):
    id: int
    role: UserRole
    is_active: bool
    rating: Optional[float] = None
    total_reviews: Optional[int] = None
    bio: Optional[str] = None
    experience_years: Optional[int] = None
    profile_image: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Service Schemas
class ServiceBase(BaseModel):
    name: str
    name_ru: Optional[str] = None
    name_ky: Optional[str] = None
    description: Optional[str] = None
    description_ru: Optional[str] = None
    description_ky: Optional[str] = None
    category: ServiceCategory
    price: float
    duration_minutes: int
    image_url: Optional[str] = None

class ServiceCreate(ServiceBase):
    pass

class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    name_ru: Optional[str] = None
    name_ky: Optional[str] = None
    description: Optional[str] = None
    description_ru: Optional[str] = None
    description_ky: Optional[str] = None
    category: Optional[ServiceCategory] = None
    price: Optional[float] = None
    duration_minutes: Optional[int] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None

class ServiceResponse(ServiceBase):
    id: int
    professional_id: int
    is_active: bool
    created_at: datetime
    professional: Optional[UserResponse] = None
    
    class Config:
        from_attributes = True

# Booking Schemas
class BookingBase(BaseModel):
    service_id: int
    booking_date: datetime
    address: str
    address_details: Optional[str] = None
    phone: str
    notes: Optional[str] = None

class BookingCreate(BookingBase):
    pass

class BookingUpdate(BaseModel):
    booking_date: Optional[datetime] = None
    address: Optional[str] = None
    address_details: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[BookingStatus] = None
    notes: Optional[str] = None

class BookingResponse(BookingBase):
    id: int
    client_id: int
    professional_id: int
    status: BookingStatus
    total_price: float
    created_at: datetime
    updated_at: Optional[datetime] = None
    service: Optional[ServiceResponse] = None
    client: Optional[UserResponse] = None
    professional: Optional[UserResponse] = None
    
    class Config:
        from_attributes = True

# Review Schemas
class ReviewBase(BaseModel):
    rating: int
    comment: Optional[str] = None

class ReviewCreate(ReviewBase):
    booking_id: int

class ReviewResponse(ReviewBase):
    id: int
    booking_id: int
    client_id: int
    professional_id: int
    created_at: datetime
    client: Optional[UserResponse] = None
    
    class Config:
        from_attributes = True

