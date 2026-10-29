from app.routers.auth import router as auth_router
from app.routers.reports import router as reports_router
from app.routers.matches import router as matches_router
from app.routers.claims import router as claims_router
from app.routers.notifications import router as notifications_router
from app.routers.admin import router as admin_router

__all__ = [
    "auth_router",
    "reports_router",
    "matches_router",
    "claims_router",
    "notifications_router",
    "admin_router",
]
