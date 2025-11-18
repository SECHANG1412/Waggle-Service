from sqlalchemy.ext.asyncio import AsyncSession
from app.db.crud import LikeCrud


class LikeService:
    @staticmethod
    async def toggle_topic_like(db: AsyncSession, user_id: int, topic_id: int) -> bool:
        try:
            like = await LikeCrud.get_topic_like_by_user_and_topic(
                db, user_id, topic_id
            )
            if like:
                await LikeCrud.delete_topic_like(db, like.like_id)
                result = False
            else:
                await LikeCrud.create_topic_like(db, user_id, topic_id)
                result = True
            await db.commit()
            return result
        except Exception:
            await db.rollback()
            raise

    @staticmethod
    async def toggle_comment_like(
        db: AsyncSession, user_id: int, comment_id: int
    ) -> bool:
        try:
            like = await LikeCrud.get_comment_like_by_user_and_comment(
                db, user_id, comment_id
            )
            if like:
                await LikeCrud.delete_comment_like(db, like.like_id)
                result = False
            else:
                await LikeCrud.create_comment_like(db, user_id, comment_id)
                result = True
            await db.commit()
            return result
        except Exception:
            await db.rollback()
            raise

    @staticmethod
    async def toggle_reply_like(db: AsyncSession, user_id: int, reply_id: int) -> bool:
        try:
            like = await LikeCrud.get_reply_like_by_user_and_reply(
                db, user_id, reply_id
            )
            if like:
                await LikeCrud.delete_reply_like(db, like.like_id)
                result = False
            else:
                await LikeCrud.create_reply_like(db, user_id, reply_id)
                result = True
            await db.commit()
            return result
        except Exception:
            await db.rollback()
            raise
