from typing import Optional
from sqlalchemy.orm import Session
from app.models.notification import Notification

class NotificationService:
    def create_notification(
        self,
        db: Session,
        user_id: str,
        title: str,
        message: str,
        link_url: Optional[str] = None
    ) -> Notification:
        notification = Notification(
            user_id=user_id,
            title=title,
            message=message,
            link_url=link_url,
            is_read=False
        )
        db.add(notification)
        db.commit()
        db.refresh(notification)
        return notification

    def get_user_notifications(
        self, 
        db: Session, 
        user_id: str, 
        limit: int = 50
    ) -> list[Notification]:
        return db.query(Notification)\
            .filter(Notification.user_id == user_id)\
            .order_by(Notification.created_at.desc())\
            .limit(limit)\
            .all()

    def get_unread_count(self, db: Session, user_id: str) -> int:
        return db.query(Notification)\
            .filter(Notification.user_id == user_id, Notification.is_read == False)\
            .count()

    def mark_as_read(self, db: Session, notification_id: str, user_id: str) -> bool:
        notification = db.query(Notification)\
            .filter(Notification.id == notification_id, Notification.user_id == user_id)\
            .first()
        if notification:
            notification.is_read = True
            db.commit()
            return True
        return False

    def mark_all_as_read(self, db: Session, user_id: str) -> int:
        updated = db.query(Notification)\
            .filter(Notification.user_id == user_id, Notification.is_read == False)\
            .update({"is_read": True})
        db.commit()
        return updated

notification_service = NotificationService()
