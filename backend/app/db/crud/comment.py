from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select
from app.db.models import Comment
from app.db.schemas.comments import CommentCreate, CommentUpdate


class CommentCrud:
    @staticmethod
    async def get_by_id(db: AsyncSession, comment_id: int):
        return await db.get(Comment, comment_id)

    @staticmethod
    async def create(db: AsyncSession, comment_data: CommentCreate, user_id: int):
        comment = Comment(user_id=user_id, **comment_data.model_dump())
        db.add(comment)
        await db.flush()
        return comment

    @staticmethod
    async def update_by_id(
        db: AsyncSession, comment_id: int, comment_data: CommentUpdate
    ):
        comment = await db.get(Comment, comment_id)
        if comment:
            for key, value in comment_data.model_dump().items():
                setattr(comment, key, value)
            await db.flush()
        return comment

    @staticmethod
    async def get_all_by_topic_id(db: AsyncSession, topic_id: int):
        result = await db.execute(
            select(Comment)
            .filter(Comment.topic_id == topic_id)
            .order_by(Comment.created_at.asc(), Comment.comment_id.asc())
        )
        return result.scalars().all()

    @staticmethod
    async def count_by_topic_id(db: AsyncSession, topic_id: int) -> int:
        result = await db.execute(select(Comment).filter(Comment.topic_id == topic_id))
        return len(result.scalars().all())

    @staticmethod
    async def count_active_by_topic_id(db: AsyncSession, topic_id: int) -> int:
        result = await db.execute(
            select(func.count())
            .select_from(Comment)
            .where(Comment.topic_id == topic_id, not Comment.is_deleted)
        )
        return result.scalar() or 0

    @staticmethod
    async def count_active_by_topic_ids(
        db: AsyncSession, topic_ids: list[int]
    ) -> dict[int, int]:
        if not topic_ids:
            return {}

        result = await db.execute(
            select(Comment.topic_id, func.count())
            .select_from(Comment)
            .where(Comment.topic_id.in_(topic_ids), not Comment.is_deleted)
            .group_by(Comment.topic_id)
        )
        return {topic_id: count for topic_id, count in result.all()}

    @staticmethod
    async def delete_by_id(db: AsyncSession, comment_id: int):
        comment = await db.get(Comment, comment_id)
        if comment:
            await db.delete(comment)
            await db.flush()
        return comment
