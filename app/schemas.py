from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from app.models import (
    UserRole, BookingStatus, ServiceCategory, HabitCategory, ProgramStatus, DayStatus,
    BlogPostStatus, NewsItemStatus, ProductOrderStatus
)

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

# Beauty Tracker Schemas
class TrackerHabitBase(BaseModel):
    category: HabitCategory
    title: str
    title_ru: Optional[str] = None
    title_ky: Optional[str] = None
    description: Optional[str] = None
    description_ru: Optional[str] = None
    description_ky: Optional[str] = None
    # program_template_id убран, так как привычка может быть в нескольких программах

class TrackerHabitCreate(TrackerHabitBase):
    pass

class TrackerHabitUpdate(BaseModel):
    category: Optional[HabitCategory] = None
    title: Optional[str] = None
    title_ru: Optional[str] = None
    title_ky: Optional[str] = None
    description: Optional[str] = None
    description_ru: Optional[str] = None
    description_ky: Optional[str] = None
    is_active: Optional[bool] = None

class TrackerHabitResponse(TrackerHabitBase):
    id: int
    is_active: bool
    created_at: datetime
    # program_template убран, так как привычка может быть в нескольких программах
    # Вместо этого используется day_ids в get_habits endpoint
    
    class Config:
        from_attributes = True

class TrackerProgramTemplateBase(BaseModel):
    name: str
    description: Optional[str] = None
    description_ru: Optional[str] = None
    description_ky: Optional[str] = None
    days_count: Optional[int] = 30
    version: Optional[int] = 1

class TrackerProgramTemplateCreate(TrackerProgramTemplateBase):
    pass

class TrackerProgramTemplateUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    description_ru: Optional[str] = None
    description_ky: Optional[str] = None
    days_count: Optional[int] = None
    version: Optional[int] = None
    is_active: Optional[bool] = None

class TrackerProgramTemplateResponse(TrackerProgramTemplateBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class TrackerProgramDayBase(BaseModel):
    day_number: int
    focus_text: Optional[str] = None
    focus_text_ru: Optional[str] = None
    focus_text_ky: Optional[str] = None

class TrackerProgramDayCreate(TrackerProgramDayBase):
    program_template_id: int

class TrackerProgramDayResponse(TrackerProgramDayBase):
    id: int
    program_template_id: int
    created_at: datetime
    habits: Optional[List[TrackerHabitResponse]] = None
    
    class Config:
        from_attributes = True

class TrackerUserProgramResponse(BaseModel):
    id: int
    user_id: int
    program_template_id: int
    started_at: datetime
    finished_at: Optional[datetime] = None
    status: ProgramStatus
    allowed_skips: int
    used_skips: int
    template: Optional[TrackerProgramTemplateResponse] = None
    
    class Config:
        from_attributes = True

class TrackerUserDayLogResponse(BaseModel):
    id: int
    habit_id: int
    completed: bool
    completed_at: Optional[datetime] = None
    habit: Optional[TrackerHabitResponse] = None
    
    class Config:
        from_attributes = True

class TrackerUserDayResponse(BaseModel):
    id: int
    day_number: int
    status: DayStatus
    opened_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None
    focus_text: Optional[str] = None
    focus_text_ru: Optional[str] = None
    focus_text_ky: Optional[str] = None
    habits: Optional[List[dict]] = None  # List of {habit, completed, log_id}
    
    class Config:
        from_attributes = True

class TrackerProgressResponse(BaseModel):
    total_days: int
    completed_days: int
    skipped_days: int
    current_streak: int
    completion_percentage: float
    current_day: Optional[int] = None
    used_skips: int
    allowed_skips: int

class TrackerPublicInfo(BaseModel):
    title: str
    title_ru: Optional[str] = None
    title_ky: Optional[str] = None
    description: str
    description_ru: Optional[str] = None
    description_ky: Optional[str] = None
    benefits: List[str]
    benefits_ru: Optional[List[str]] = None
    benefits_ky: Optional[List[str]] = None

# Blog Schemas
class BlogCategoryBase(BaseModel):
    slug: str
    name: str
    name_ru: Optional[str] = None
    name_ky: Optional[str] = None

class BlogCategoryCreate(BlogCategoryBase):
    pass

class BlogCategoryResponse(BlogCategoryBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class BlogTagBase(BaseModel):
    name: str

class BlogTagCreate(BlogTagBase):
    pass

class BlogTagResponse(BlogTagBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class BlogPostBase(BaseModel):
    title: str
    title_ru: Optional[str] = None
    title_ky: Optional[str] = None
    content: str
    cover_image_url: Optional[str] = None
    category_id: Optional[int] = None

class BlogPostCreate(BlogPostBase):
    tag_ids: Optional[List[int]] = []

class BlogPostUpdate(BaseModel):
    title: Optional[str] = None
    title_ru: Optional[str] = None
    title_ky: Optional[str] = None
    content: Optional[str] = None
    cover_image_url: Optional[str] = None
    category_id: Optional[int] = None
    tag_ids: Optional[List[int]] = None

class BlogPostResponse(BlogPostBase):
    id: int
    author_id: int
    status: BlogPostStatus
    rejection_reason: Optional[str] = None
    published_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    author: Optional[UserResponse] = None
    category: Optional[BlogCategoryResponse] = None
    tags: Optional[List[BlogTagResponse]] = []
    
    class Config:
        from_attributes = True

# News Schemas
class NewsSourceBase(BaseModel):
    name: str
    base_url: str
    feed_url: Optional[str] = None
    parse_type: str = "rss"
    language: str = "ru"
    fetch_interval_minutes: int = 60

class NewsSourceCreate(NewsSourceBase):
    pass

class NewsSourceUpdate(BaseModel):
    name: Optional[str] = None
    base_url: Optional[str] = None
    feed_url: Optional[str] = None
    parse_type: Optional[str] = None
    language: Optional[str] = None
    is_active: Optional[bool] = None
    fetch_interval_minutes: Optional[int] = None

class NewsSourceResponse(NewsSourceBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class NewsCategoryBase(BaseModel):
    slug: str
    name: str
    name_ru: Optional[str] = None
    name_ky: Optional[str] = None

class NewsCategoryCreate(NewsCategoryBase):
    pass

class NewsCategoryResponse(NewsCategoryBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class NewsItemBase(BaseModel):
    title: str
    excerpt: Optional[str] = None
    image_url: Optional[str] = None
    original_url: str
    published_at: Optional[datetime] = None

class NewsItemCreate(NewsItemBase):
    source_id: int
    category_id: Optional[int] = None

class NewsItemResponse(NewsItemBase):
    id: int
    source_id: int
    category_id: Optional[int] = None
    status: NewsItemStatus
    created_at: datetime
    source: Optional[NewsSourceResponse] = None
    category: Optional[NewsCategoryResponse] = None
    
    class Config:
        from_attributes = True

# Product Schemas
class ProductCategoryBase(BaseModel):
    slug: str
    name: str
    name_ru: Optional[str] = None
    name_ky: Optional[str] = None

class ProductCategoryCreate(ProductCategoryBase):
    pass

class ProductCategoryResponse(ProductCategoryBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class ProductImageBase(BaseModel):
    image_url: str
    sort_order: int = 0

class ProductImageCreate(ProductImageBase):
    pass

class ProductImageResponse(ProductImageBase):
    id: int
    product_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    name: str
    name_ru: Optional[str] = None
    name_ky: Optional[str] = None
    description: Optional[str] = None
    description_ru: Optional[str] = None
    description_ky: Optional[str] = None
    price: float
    currency: str = "KGS"
    stock_qty: Optional[int] = None
    category_id: Optional[int] = None

class ProductCreate(ProductBase):
    image_urls: Optional[List[str]] = []

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    name_ru: Optional[str] = None
    name_ky: Optional[str] = None
    description: Optional[str] = None
    description_ru: Optional[str] = None
    description_ky: Optional[str] = None
    price: Optional[float] = None
    currency: Optional[str] = None
    stock_qty: Optional[int] = None
    category_id: Optional[int] = None
    is_active: Optional[bool] = None
    image_urls: Optional[List[str]] = None

class ProductResponse(ProductBase):
    id: int
    seller_id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    seller: Optional[UserResponse] = None
    category: Optional[ProductCategoryResponse] = None
    images: Optional[List[ProductImageResponse]] = []
    
    class Config:
        from_attributes = True

class ProductOrderItemBase(BaseModel):
    product_id: int
    qty: int

class ProductOrderItemCreate(ProductOrderItemBase):
    pass

class ProductOrderItemResponse(ProductOrderItemBase):
    id: int
    order_id: int
    unit_price: float
    created_at: datetime
    product: Optional[ProductResponse] = None
    
    class Config:
        from_attributes = True

class ProductOrderBase(BaseModel):
    items: List[ProductOrderItemCreate]
    address: Optional[str] = None
    phone: Optional[str] = None
    notes: Optional[str] = None

class ProductOrderCreate(ProductOrderBase):
    seller_id: int

class ProductOrderUpdate(BaseModel):
    status: Optional[ProductOrderStatus] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    notes: Optional[str] = None

class ProductOrderResponse(BaseModel):
    id: int
    client_id: int
    seller_id: int
    status: ProductOrderStatus
    total_price: float
    address: Optional[str] = None
    phone: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    client: Optional[UserResponse] = None
    seller: Optional[UserResponse] = None
    items: Optional[List[ProductOrderItemResponse]] = []
    
    class Config:
        from_attributes = True
