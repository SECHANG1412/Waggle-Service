from sqlalchemy import desc, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import Notification
from app.db.schemas.notifications import NotificationCreate


class NotificationCrud:
    @staticmethod
    async def create(db: AsyncSession, data: NotificationCreate) -> Notification:
        notification = Notification(**data.model_dump())
        db.add(notification)
        await db.flush()
        return notification

    @staticmethod
    async def get_by_id(db: AsyncSession, notification_id: int) -> Notification | None:
        return await db.get(Notification, notification_id)

    @staticmethod
    async def get_all_by_user_id(
        db: AsyncSession, user_id: int, limit: int = 10, offset: int = 0
    ) -> list[Notification]:
        result = await db.execute(
            select(Notification)
            .where(Notification.user_id == user_id)
            .order_by(desc(Notification.created_at), desc(Notification.notification_id))
            .limit(limit)
            .offset(offset)
        )
        return list(result.scalars().all())

    @staticmethod
    async def count_unread_by_user_id(db: AsyncSession, user_id: int) -> int:
        result = await db.execute(
            select(func.count(Notification.notification_id)).where(
                Notification.user_id == user_id,
                Notification.is_read.is_(False),
            )
        )
        return result.scalar_one() or 0

    @staticmethod
    async def mark_as_read(db: AsyncSession, notification: Notification) -> Notification:
        notification.is_read = True
        await db.flush()
        return notification

    @staticmethod
    async def mark_all_as_read(db: AsyncSession, user_id: int) -> int:
        result = await db.execute(
            update(Notification)
            .where(Notification.user_id == user_id, Notification.is_read.is_(False))
            .values(is_read=True)
        )
        await db.flush()
        return result.rowcount or 0
