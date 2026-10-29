from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.notification import NotificationOut, NotificationCount
from app.services.notification_service import notification_service

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("/", response_model=list[NotificationOut])
def list_notifications(
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves all notifications for the authenticated user."""
    return notification_service.get_user_notifications(db, current_user.id, limit=limit)

@router.get("/unread-count", response_model=NotificationCount)
def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Returns number of unread notifications for notification badge."""
    count = notification_service.get_unread_count(db, current_user.id)
    return {"unread_count": count}

@router.patch("/{notification_id}/read")
def mark_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Marks a single notification as read."""
    success = notification_service.mark_as_read(db, notification_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found.")
    return {"message": "Notification marked as read."}

@router.patch("/read-all")
def mark_all_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Marks all user notifications as read."""
    count = notification_service.mark_all_as_read(db, current_user.id)
    return {"message": f"Marked {count} notifications as read."}
