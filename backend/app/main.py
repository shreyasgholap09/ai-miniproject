from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.core.security import get_password_hash
from app.database.session import engine, SessionLocal, Base
from app.models import User, ItemReport, ItemMatch, ItemClaim, Notification
from app.routers import (
    auth_router,
    reports_router,
    matches_router,
    claims_router,
    notifications_router,
    admin_router
)

def init_db_and_admin():
    """Initializes tables and seeds the primary administrator account."""
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        admin_user = db.query(User).filter(User.email == settings.ADMIN_EMAIL.lower()).first()
        if not admin_user:
            admin_user = User(
                name=settings.ADMIN_NAME,
                email=settings.ADMIN_EMAIL.lower(),
                password_hash=get_password_hash(settings.ADMIN_PASSWORD),
                role="admin",
                is_active=True
            )
            db.add(admin_user)
            db.commit()
            print(f"[Startup] Primary administrator seeded: {settings.ADMIN_EMAIL}")
    except Exception as e:
        print(f"[Startup] Error during initialization: {e}")
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("[Startup] Initializing database and AI models...")
    init_db_and_admin()
    yield
    # Shutdown
    print("[Shutdown] Cleaning up resources...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Multimodal AI-assisted Lost and Found Items Matching System",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded item photos statically
app.mount("/uploads", StaticFiles(directory=str(settings.UPLOAD_PATH)), name="uploads")

# Include Routers under API prefix
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(reports_router, prefix=settings.API_V1_STR)
app.include_router(matches_router, prefix=settings.API_V1_STR)
app.include_router(claims_router, prefix=settings.API_V1_STR)
app.include_router(notifications_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "project": settings.PROJECT_NAME,
        "status": "online",
        "api_docs": "/docs",
        "version": "1.0.0"
    }
