from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.crud import NotificationCrud
from app.db.schemas.notifications import (
    NotificationCreate,
    NotificationRead,
    NotificationUnreadCount,
)


class NotificationService:
    @staticmethod
    async def create(db: AsyncSession, data: NotificationCreate):
        return await NotificationCrud.create(db, data)

    @staticmethod
    async def create_if_not_self(
        db: AsyncSession,
        *,
        user_id: int,
        type: str,
        actor_user_id: int | None,
        target_type: str,
        target_id: int,
        topic_id: int | None,
        message: str,
        link: str,
    ):
        if actor_user_id is not None and user_id == actor_user_id:
            return None

        return await NotificationService.create(
            db,
            NotificationCreate(
                user_id=user_id,
                type=type,
                actor_user_id=actor_user_id,
                target_type=target_type,
                target_id=target_id,
                topic_id=topic_id,
                message=message,
                link=link,
            ),
        )

    @staticmethod
    async def list_for_user(
        db: AsyncSession, user_id: int, limit: int = 10, offset: int = 0
    ) -> list[NotificationRead]:
        notifications = await NotificationCrud.get_all_by_user_id(
            db, user_id, limit=limit, offset=offset
        )
        return [NotificationRead.model_validate(item) for item in notifications]

    @staticmethod
    async def unread_count(db: AsyncSession, user_id: int) -> NotificationUnreadCount:
        count = await NotificationCrud.count_unread_by_user_id(db, user_id)
        return NotificationUnreadCount(count=count)

    @staticmethod
    async def mark_as_read(
        db: AsyncSession, user_id: int, notification_id: int
    ) -> NotificationRead:
        notification = await NotificationCrud.get_by_id(db, notification_id)
        if not notification or notification.user_id != user_id:
            raise HTTPException(status_code=404, detail="Notification not found")

        try:
            updated = await NotificationCrud.mark_as_read(db, notification)
            await db.commit()
            await db.refresh(updated)
            return NotificationRead.model_validate(updated)
        except Exception:
            await db.rollback()
            raise

    @staticmethod
    async def mark_all_as_read(db: AsyncSession, user_id: int) -> dict[str, int]:
        try:
            updated_count = await NotificationCrud.mark_all_as_read(db, user_id)
            await db.commit()
            return {"updated_count": updated_count}
        except Exception:
            await db.rollback()
            raise
