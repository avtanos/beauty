from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import auth, users, services, bookings, reviews, admin, professional, client

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Tunuk",
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

@app.get("/")
async def root():
    return {"message": "Tunuk API - Beauty Services"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

