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
    blog_posts = relationship("BlogPost", foreign_keys="BlogPost.author_id")
    products_sold = relationship("Product", foreign_keys="Product.seller_id")
    product_orders_as_client = relationship("ProductOrder", foreign_keys="ProductOrder.client_id")
    product_orders_as_seller = relationship("ProductOrder", foreign_keys="ProductOrder.seller_id")

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

# Beauty Tracker Models
class HabitCategory(str, enum.Enum):
    FACE = "face"
    BODY = "body"
    LIFESTYLE = "lifestyle"
    FOCUS = "focus"

class ProgramStatus(str, enum.Enum):
    ACTIVE = "active"
    FINISHED = "finished"
    CANCELLED = "cancelled"

class DayStatus(str, enum.Enum):
    LOCKED = "locked"
    OPEN = "open"
    COMPLETED = "completed"
    SKIPPED = "skipped"

class TrackerHabit(Base):
    __tablename__ = "tracker_habits"
    
    id = Column(Integer, primary_key=True, index=True)
    category = Column(Enum(HabitCategory), nullable=False)
    title = Column(String, nullable=False)
    title_ru = Column(String, nullable=True)
    title_ky = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    description_ru = Column(Text, nullable=True)
    description_ky = Column(Text, nullable=True)
    program_template_id = Column(Integer, ForeignKey("tracker_program_templates.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    program_template = relationship("TrackerProgramTemplate", foreign_keys=[program_template_id])
    program_day_habits = relationship("TrackerProgramDayHabit", back_populates="habit")
    user_day_logs = relationship("TrackerUserDayLog", back_populates="habit")

class TrackerProgramTemplate(Base):
    __tablename__ = "tracker_program_templates"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    description_ru = Column(Text, nullable=True)
    description_ky = Column(Text, nullable=True)
    days_count = Column(Integer, default=30)  # Количество дней в программе
    version = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    program_days = relationship("TrackerProgramDay", back_populates="template", order_by="TrackerProgramDay.day_number")
    user_programs = relationship("TrackerUserProgram", back_populates="template")

class TrackerProgramDay(Base):
    __tablename__ = "tracker_program_days"
    
    id = Column(Integer, primary_key=True, index=True)
    program_template_id = Column(Integer, ForeignKey("tracker_program_templates.id"), nullable=False)
    day_number = Column(Integer, nullable=False)  # 1-30
    focus_text = Column(Text, nullable=True)
    focus_text_ru = Column(Text, nullable=True)
    focus_text_ky = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    template = relationship("TrackerProgramTemplate", back_populates="program_days")
    day_habits = relationship("TrackerProgramDayHabit", back_populates="program_day", order_by="TrackerProgramDayHabit.sort_order")

class TrackerProgramDayHabit(Base):
    __tablename__ = "tracker_program_day_habits"
    
    id = Column(Integer, primary_key=True, index=True)
    program_day_id = Column(Integer, ForeignKey("tracker_program_days.id"), nullable=False)
    habit_id = Column(Integer, ForeignKey("tracker_habits.id"), nullable=False)
    sort_order = Column(Integer, default=0)
    
    # Relationships
    program_day = relationship("TrackerProgramDay", back_populates="day_habits")
    habit = relationship("TrackerHabit", back_populates="program_day_habits")

class TrackerUserProgram(Base):
    __tablename__ = "tracker_user_programs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    program_template_id = Column(Integer, ForeignKey("tracker_program_templates.id"), nullable=False)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    finished_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(Enum(ProgramStatus), default=ProgramStatus.ACTIVE)
    allowed_skips = Column(Integer, default=3)
    used_skips = Column(Integer, default=0)
    
    # Relationships
    user = relationship("User")
    template = relationship("TrackerProgramTemplate", back_populates="user_programs")
    user_days = relationship("TrackerUserDay", back_populates="user_program", order_by="TrackerUserDay.day_number")

class TrackerUserDay(Base):
    __tablename__ = "tracker_user_days"
    
    id = Column(Integer, primary_key=True, index=True)
    user_program_id = Column(Integer, ForeignKey("tracker_user_programs.id"), nullable=False)
    day_number = Column(Integer, nullable=False)  # 1-30
    status = Column(Enum(DayStatus), default=DayStatus.LOCKED)
    opened_at = Column(DateTime(timezone=True), nullable=True)
    closed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user_program = relationship("TrackerUserProgram", back_populates="user_days")
    program_day = relationship("TrackerProgramDay", foreign_keys="TrackerProgramDay.day_number", primaryjoin="TrackerUserDay.day_number == TrackerProgramDay.day_number", viewonly=True)
    logs = relationship("TrackerUserDayLog", back_populates="user_day")

class TrackerUserDayLog(Base):
    __tablename__ = "tracker_user_day_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_day_id = Column(Integer, ForeignKey("tracker_user_days.id"), nullable=False)
    habit_id = Column(Integer, ForeignKey("tracker_habits.id"), nullable=False)
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user_day = relationship("TrackerUserDay", back_populates="logs")
    habit = relationship("TrackerHabit", back_populates="user_day_logs")

# Blog Models
class BlogPostStatus(str, enum.Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    PUBLISHED = "published"
    REJECTED = "rejected"
    ARCHIVED = "archived"

class BlogCategory(Base):
    __tablename__ = "blog_categories"
    
    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    name_ru = Column(String, nullable=True)
    name_ky = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    posts = relationship("BlogPost", back_populates="category")

class BlogTag(Base):
    __tablename__ = "blog_tags"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    posts = relationship("BlogPostTag", back_populates="tag")

class BlogPost(Base):
    __tablename__ = "blog_posts"
    
    id = Column(Integer, primary_key=True, index=True)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("blog_categories.id"), nullable=True)
    title = Column(String, nullable=False)
    title_ru = Column(String, nullable=True)
    title_ky = Column(String, nullable=True)
    content = Column(Text, nullable=False)  # Markdown/HTML
    cover_image_url = Column(String, nullable=True)
    status = Column(Enum(BlogPostStatus), default=BlogPostStatus.DRAFT)
    rejection_reason = Column(Text, nullable=True)
    published_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    author = relationship("User")
    category = relationship("BlogCategory", back_populates="posts")
    tags = relationship("BlogPostTag", back_populates="post")

class BlogPostTag(Base):
    __tablename__ = "blog_post_tags"
    
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("blog_posts.id"), nullable=False)
    tag_id = Column(Integer, ForeignKey("blog_tags.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    post = relationship("BlogPost", back_populates="tags")
    tag = relationship("BlogTag", back_populates="posts")

# News/Useful Models
class NewsSourceStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    HIDDEN = "hidden"

class NewsItemStatus(str, enum.Enum):
    ACTIVE = "active"
    HIDDEN = "hidden"

class NewsSource(Base):
    __tablename__ = "news_sources"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    base_url = Column(String, nullable=False)
    feed_url = Column(String, nullable=True)  # RSS feed URL
    parse_type = Column(String, default="rss")  # rss, html, api
    language = Column(String, default="ru")  # en, ru, ky
    is_active = Column(Boolean, default=True)
    fetch_interval_minutes = Column(Integer, default=60)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    items = relationship("NewsItem", back_populates="source")

class NewsCategory(Base):
    __tablename__ = "news_categories"
    
    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    name_ru = Column(String, nullable=True)
    name_ky = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    items = relationship("NewsItem", back_populates="category")

class NewsItem(Base):
    __tablename__ = "news_items"
    
    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, ForeignKey("news_sources.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("news_categories.id"), nullable=True)
    title = Column(String, nullable=False)
    excerpt = Column(Text, nullable=True)  # Короткий текст, не полный контент
    image_url = Column(String, nullable=True)
    original_url = Column(String, unique=True, nullable=False, index=True)
    published_at = Column(DateTime(timezone=True), nullable=True)  # Дата публикации в источнике
    status = Column(Enum(NewsItemStatus), default=NewsItemStatus.ACTIVE)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    source = relationship("NewsSource", back_populates="items")
    category = relationship("NewsCategory", back_populates="items")

# Products Models
class ProductOrderStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PACKED = "packed"
    SHIPPED = "shipped"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class ProductCategory(Base):
    __tablename__ = "product_categories"
    
    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    name_ru = Column(String, nullable=True)
    name_ky = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    products = relationship("Product", back_populates="category")

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("product_categories.id"), nullable=True)
    name = Column(String, nullable=False)
    name_ru = Column(String, nullable=True)
    name_ky = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    description_ru = Column(Text, nullable=True)
    description_ky = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    currency = Column(String, default="KGS")  # KGS, USD, etc.
    stock_qty = Column(Integer, nullable=True)  # null = unlimited
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    seller = relationship("User")
    category = relationship("ProductCategory", back_populates="products")
    images = relationship("ProductImage", back_populates="product", order_by="ProductImage.sort_order")
    order_items = relationship("ProductOrderItem", back_populates="product")

class ProductImage(Base):
    __tablename__ = "product_images"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    image_url = Column(String, nullable=False)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    product = relationship("Product", back_populates="images")

class ProductOrder(Base):
    __tablename__ = "product_orders"
    
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(Enum(ProductOrderStatus), default=ProductOrderStatus.PENDING)
    total_price = Column(Float, nullable=False)
    address = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    client = relationship("User", foreign_keys=[client_id])
    seller = relationship("User", foreign_keys=[seller_id])
    items = relationship("ProductOrderItem", back_populates="order")

class ProductOrderItem(Base):
    __tablename__ = "product_order_items"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("product_orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    qty = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)  # Цена на момент заказа
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    order = relationship("ProductOrder", back_populates="items")
    product = relationship("Product", back_populates="order_items")
