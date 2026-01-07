from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum

class UserRole(str, enum.Enum):
    CLIENT = "client"
    PROFESSIONAL = "professional"
    ADMIN = "admin"

class BookingStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class ServiceCategory(str, enum.Enum):
    BEAUTY = "beauty"
    SPA = "spa"
    MASSAGE = "massage"
    HAIRCUT = "haircut"
    NAIL_CARE = "nail_care"
    CLEANING = "cleaning"
    REPAIR = "repair"
    OTHER = "other"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.CLIENT)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # For professionals
    rating = Column(Float, default=0.0)
    total_reviews = Column(Integer, default=0)
    bio = Column(Text, nullable=True)
    experience_years = Column(Integer, nullable=True)
    profile_image = Column(String, nullable=True)
    
    # Relationships
    services = relationship("Service", back_populates="professional")
    bookings_as_client = relationship("Booking", foreign_keys="Booking.client_id", back_populates="client")
    bookings_as_professional = relationship("Booking", foreign_keys="Booking.professional_id", back_populates="professional")
    reviews_given = relationship("Review", foreign_keys="Review.client_id", back_populates="client")
    reviews_received = relationship("Review", foreign_keys="Review.professional_id", back_populates="professional")

class Service(Base):
    __tablename__ = "services"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    name_ru = Column(String, nullable=True)  # Русское название
    name_ky = Column(String, nullable=True)  # Кыргызское название
    description = Column(Text, nullable=True)
    description_ru = Column(Text, nullable=True)
    description_ky = Column(Text, nullable=True)
    category = Column(Enum(ServiceCategory), nullable=False)
    price = Column(Float, nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    professional_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    image_url = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    professional = relationship("User", back_populates="services")
    bookings = relationship("Booking", back_populates="service")

class Booking(Base):
    __tablename__ = "bookings"
    
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    professional_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=False)
    booking_date = Column(DateTime(timezone=True), nullable=False)
    address = Column(String, nullable=False)
    address_details = Column(Text, nullable=True)
    phone = Column(String, nullable=False)
    status = Column(Enum(BookingStatus), default=BookingStatus.PENDING)
    total_price = Column(Float, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    client = relationship("User", foreign_keys=[client_id], back_populates="bookings_as_client")
    professional = relationship("User", foreign_keys=[professional_id], back_populates="bookings_as_professional")
    service = relationship("Service", back_populates="bookings")
    review = relationship("Review", back_populates="booking", uselist=False)

class Review(Base):
    __tablename__ = "reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), unique=True, nullable=False)
    client_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    professional_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, nullable=False)  # 1-5
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    booking = relationship("Booking", back_populates="review")
    client = relationship("User", foreign_keys=[client_id], back_populates="reviews_given")
    professional = relationship("User", foreign_keys=[professional_id], back_populates="reviews_received")

