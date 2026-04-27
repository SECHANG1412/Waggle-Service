from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import desc, func, or_, select
from app.db.models import Topic, TopicLike
from app.db.schemas.topics import TopicCreate

class TopicCrud:

    @staticmethod
    async def create(db: AsyncSession, topic_data: TopicCreate, user_id:int) -> Topic:
        topic_dict = topic_data.model_dump()
        topic_dict["user_id"] = user_id
        new_topic = Topic(**topic_dict)
        db.add(new_topic)
        await db.flush()
        return new_topic
    
    @staticmethod
    async def get_by_id(db:AsyncSession, topic_id: int) -> Topic | None:
        return await db.get(Topic, topic_id)

    @staticmethod
    async def get_public_by_id(db: AsyncSession, topic_id: int) -> Topic | None:
        result = await db.execute(
            select(Topic).where(Topic.topic_id == topic_id, Topic.is_hidden.is_(False))
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def delete_by_id(db:AsyncSession, topic_id:int) -> bool:
        topic = await db.get(Topic, topic_id)
        if topic:
            await db.delete(topic)
            await db.flush()
            return True
        return False
    
    @staticmethod
    async def count_by_user_id(db:AsyncSession, user_id:int) -> int:
        result = await db.execute(select(func.count()).where(Topic.user_id == user_id))
        return result.scalar() or 0

    @staticmethod
    async def get_recent_by_user_id(db: AsyncSession, user_id: int, limit: int = 5):
        result = await db.execute(
            select(Topic)
            .where(Topic.user_id == user_id)
            .order_by(desc(Topic.created_at))
            .limit(limit)
        )
        return result.scalars().all()
    
    @staticmethod
    async def get_all_with_filters(
        db:AsyncSession,
        search: str | None = None,
        category: str | None = None,
        sort: str = "created_at",
        limit: int = 10,
        offset: int = 0
    ):
        like_count_subq = (
            select(func.count(TopicLike.like_id))
            .where(TopicLike.topic_id == Topic.topic_id)
            .scalar_subquery()
        )

        base_query = select(Topic).where(Topic.is_hidden.is_(False))

        if search:
            base_query = base_query.where(
                or_(
                    Topic.title.ilike(f"%{search}%"),
                    Topic.description.ilike(f"%{search}%"),
                )
            )

        if category:
            base_query = base_query.where(Topic.category == category)

        if sort == "like_count":
            base_query = base_query.order_by(desc(like_count_subq), desc(Topic.created_at))
        else:
            base_query = base_query.order_by(desc(Topic.created_at))

        base_query = base_query.limit(limit).offset(offset)
        result = await db.execute(base_query)
        return result.scalars().all()
    
    @staticmethod
    async def count_all_with_filters(
        db: AsyncSession, category: str | None = None, search: str | None = None
    ) -> int:
        base_query = (
            select(func.count()).select_from(Topic).where(Topic.is_hidden.is_(False))
        )

        if category:
            base_query = base_query.where(Topic.category == category)

        if search:
            base_query = base_query.where(
                (Topic.title.ilike(f"%{search}%"))
                | (Topic.description.ilike(f"%{search}%"))
            )

        result = await db.execute(base_query)
        return result.scalar() or 0

    @staticmethod
    async def get_all_for_admin(db: AsyncSession) -> list[Topic]:
        result = await db.execute(select(Topic).order_by(desc(Topic.created_at)))
        return list(result.scalars().all())

    @staticmethod
    async def hide(
        db: AsyncSession,
        topic: Topic,
        admin_user_id: int,
    ) -> Topic:
        topic.is_hidden = True
        topic.hidden_at = datetime.now(timezone.utc)
        topic.hidden_by = admin_user_id
        await db.flush()
        return topic

    @staticmethod
    async def unhide(db: AsyncSession, topic: Topic) -> Topic:
        topic.is_hidden = False
        topic.hidden_at = None
        topic.hidden_by = None
        await db.flush()
        return topic
