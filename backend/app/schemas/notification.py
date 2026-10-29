from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class NotificationOut(BaseModel):
    id: str
    user_id: str
    title: str
    message: str
    link_url: Optional[str] = None
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class NotificationCount(BaseModel):
    unread_count: int
