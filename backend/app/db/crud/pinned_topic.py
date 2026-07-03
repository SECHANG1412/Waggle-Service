from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, delete
from app.db.models import PinnedTopic


class PinnedTopicCrud:
    @staticmethod
    async def pin(db: AsyncSession, user_id: int, topic_id: int) -> PinnedTopic:
        existing = await db.get(PinnedTopic, {"user_id": user_id, "topic_id": topic_id})
        if existing:
            return existing
        pinned = PinnedTopic(user_id=user_id, topic_id=topic_id)
        db.add(pinned)
        await db.flush()
        return pinned

    @staticmethod
    async def unpin(db: AsyncSession, user_id: int, topic_id: int) -> bool:
        result = await db.execute(
            delete(PinnedTopic).where(
                PinnedTopic.user_id == user_id, PinnedTopic.topic_id == topic_id
            )
        )
        return result.rowcount > 0

    @staticmethod
    async def unpin_by_topic(db: AsyncSession, topic_id: int) -> int:
        result = await db.execute(
            delete(PinnedTopic).where(PinnedTopic.topic_id == topic_id)
        )
        return result.rowcount or 0

    @staticmethod
    async def list_by_user(db: AsyncSession, user_id: int):
        result = await db.execute(
            select(PinnedTopic).where(PinnedTopic.user_id == user_id).order_by(desc(PinnedTopic.pinned_at))
        )
        return result.scalars().all()

    @staticmethod
    async def get_user_ids_by_topic_ids(
        db: AsyncSession, topic_ids: list[int]
    ) -> dict[int, set[int]]:
        if not topic_ids:
            return {}

        result = await db.execute(
            select(PinnedTopic.topic_id, PinnedTopic.user_id).where(
                PinnedTopic.topic_id.in_(topic_ids)
            )
        )

        user_ids_by_topic: dict[int, set[int]] = {}
        for topic_id, user_id in result.all():
            user_ids_by_topic.setdefault(topic_id, set()).add(user_id)
        return user_ids_by_topic

    @staticmethod
    async def is_pinned(db: AsyncSession, user_id: int, topic_id: int) -> bool:
        pinned = await db.get(PinnedTopic, {"user_id": user_id, "topic_id": topic_id})
        return pinned is not None
