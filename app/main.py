from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import (
    auth, users, services, bookings, reviews, admin, professional, client, tracker,
    admin_tracker, blog, admin_blog, news, admin_news, products, professional_products,
    product_orders, admin_products
)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Suluu",
    description="Beauty Services",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(services.router, prefix="/api/services", tags=["services"])
app.include_router(bookings.router, prefix="/api/bookings", tags=["bookings"])
app.include_router(reviews.router, prefix="/api/reviews", tags=["reviews"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(professional.router, prefix="/api/professional", tags=["professional"])
app.include_router(client.router, prefix="/api/client", tags=["client"])
app.include_router(tracker.router, prefix="/api/tracker", tags=["tracker"])
app.include_router(admin_tracker.router, prefix="/api/admin/tracker", tags=["admin-tracker"])
app.include_router(blog.router, prefix="/api/blog", tags=["blog"])
app.include_router(admin_blog.router, prefix="/api/admin/blog", tags=["admin-blog"])
app.include_router(news.router, prefix="/api/news", tags=["news"])
app.include_router(admin_news.router, prefix="/api/admin/news", tags=["admin-news"])
app.include_router(products.router, prefix="/api/products", tags=["products"])
app.include_router(professional_products.router, prefix="/api/professional/products", tags=["professional-products"])
app.include_router(product_orders.router, prefix="/api/product-orders", tags=["product-orders"])
app.include_router(admin_products.router, prefix="/api/admin/products", tags=["admin-products"])

@app.get("/")
async def root():
    return {"message": "Suluu API - Beauty Services"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

