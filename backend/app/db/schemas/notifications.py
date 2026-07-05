from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class NotificationCreate(BaseModel):
    user_id: int
    type: str = Field(..., max_length=50)
    actor_user_id: int | None = None
    target_type: str = Field(..., max_length=50)
    target_id: int
    topic_id: int | None = None
    message: str = Field(..., max_length=255)
    link: str = Field(..., max_length=255)


class NotificationRead(BaseModel):
    notification_id: int
    user_id: int
    type: str
    actor_user_id: int | None = None
    target_type: str
    target_id: int
    topic_id: int | None = None
    message: str
    link: str
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class NotificationUnreadCount(BaseModel):
    count: int


class NotificationReadAllResponse(BaseModel):
    updated_count: int
