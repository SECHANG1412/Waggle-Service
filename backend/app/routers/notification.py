from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_user_id
from app.db.database import get_db
from app.db.schemas.notifications import (
    NotificationRead,
    NotificationReadAllResponse,
    NotificationUnreadCount,
)
from app.services import NotificationService

router = APIRouter(prefix="/notifications", tags=["Notification"])


@router.get("", response_model=list[NotificationRead])
async def list_notifications(
    user_id: int = Depends(get_user_id),
    db: AsyncSession = Depends(get_db),
    limit: int = Query(default=10, ge=1, le=50),
    offset: int = Query(default=0, ge=0),
):
    return await NotificationService.list_for_user(
        db, user_id, limit=limit, offset=offset
    )


@router.get("/unread-count", response_model=NotificationUnreadCount)
async def get_unread_count(
    user_id: int = Depends(get_user_id),
    db: AsyncSession = Depends(get_db),
):
    return await NotificationService.unread_count(db, user_id)


@router.patch("/{notification_id}/read", response_model=NotificationRead)
async def mark_notification_as_read(
    notification_id: int,
    user_id: int = Depends(get_user_id),
    db: AsyncSession = Depends(get_db),
):
    return await NotificationService.mark_as_read(db, user_id, notification_id)


@router.patch("/read-all", response_model=NotificationReadAllResponse)
async def mark_all_notifications_as_read(
    user_id: int = Depends(get_user_id),
    db: AsyncSession = Depends(get_db),
):
    return await NotificationService.mark_all_as_read(db, user_id)
