from datetime import datetime, timedelta, timezone
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import Vote
from app.db.schemas.votes import VoteCreate


class VoteCrud:
    @staticmethod
    async def create(db: AsyncSession, vote_data: VoteCreate, user_id: int):
        vote = Vote(user_id=user_id, **vote_data.model_dump())
        db.add(vote)
        await db.flush()
        return vote

    @staticmethod
    async def get_all_by_topic_id(db: AsyncSession, topic_id: int):
        result = await db.execute(select(Vote).filter(Vote.topic_id == topic_id))
        return result.scalars().all()

    @staticmethod
    async def get_vote_counts_by_topic_id(
        db: AsyncSession, topic_id: int
    ) -> dict[int, int]:
        result = await db.execute(
            select(Vote.vote_index, func.count(Vote.vote_id))
            .where(Vote.topic_id == topic_id)
            .group_by(Vote.vote_index)
        )
        return {vote_index: count for vote_index, count in result.all()}

    @staticmethod
    async def get_all_by_user_id(db: AsyncSession, user_id: int):
        result = await db.execute(select(Vote).filter(Vote.user_id == user_id))
        return result.scalars().all()

    @staticmethod
    async def count_by_user_id(db: AsyncSession, user_id: int) -> int:
        result = await db.execute(select(func.count()).where(Vote.user_id == user_id))
        return result.scalar() or 0

    @staticmethod
    async def get_by_topic_and_user(db: AsyncSession, topic_id: int, user_id: int):
        result = await db.execute(
            select(Vote).filter((Vote.topic_id == topic_id) & (Vote.user_id == user_id))
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_all_by_topic_id_and_range(
        db: AsyncSession,
        topic_id: int,
        delta: timedelta | None,
        order_by_created: bool = True
    ) -> list[Vote]:
        base_query = select(Vote).where(Vote.topic_id == topic_id)
        if delta is not None:
            now = datetime.now(timezone.utc)
            start_time = now - delta
            base_query = base_query.where(Vote.created_at.between(start_time, now))

        if order_by_created:
            base_query = base_query.order_by(Vote.created_at)

        result = await db.execute(base_query)
        return result.scalars().all()

    @staticmethod
    async def get_first_vote_created_at(
        db: AsyncSession, topic_id: int
    ) -> datetime | None:
        result = await db.execute(
            select(func.min(Vote.created_at)).where(Vote.topic_id == topic_id)
        )
        return result.scalar_one_or_none()
