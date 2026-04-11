from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from app.db.models import Reply
from app.db.crud import UserCrud, ReplyCrud, LikeCrud, CommentCrud
from app.db.schemas.replys import ReplyRead, ReplyCreate, ReplyUpdate


class ReplyService:
    @staticmethod
    async def create(
        db: AsyncSession, user_id: int, reply_data: ReplyCreate
    ) -> ReplyRead:
        comment = await CommentCrud.get_by_id(db, reply_data.comment_id)
        if not comment:
            raise HTTPException(status_code=404, detail="Comment not found")
        if getattr(comment, "is_deleted", False):
            raise HTTPException(status_code=400, detail="Cannot reply to a deleted comment")
        if reply_data.parent_reply_id is not None:
            parent_reply = await ReplyCrud.get_by_id(db, reply_data.parent_reply_id)
            if not parent_reply:
                raise HTTPException(status_code=404, detail="Parent reply not found")
            if parent_reply.comment_id != reply_data.comment_id:
                raise HTTPException(
                    status_code=400,
                    detail="Parent reply must belong to the same comment",
                )
        try:
            reply = await ReplyCrud.create(db, reply_data, user_id)
            await db.commit()
            await db.refresh(reply)
            return await ReplyService._build_reply_read(db, reply, user_id)
        except Exception:
            await db.rollback()
            raise

    @staticmethod
    async def update_by_id(
        db: AsyncSession, reply_id: int, reply_data: ReplyUpdate, user_id: int
    ) -> ReplyRead:
        reply = await ReplyCrud.get_by_id(db, reply_id)
        if not reply:
            raise HTTPException(status_code=404, detail="Reply not found")
        if reply.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not your reply")
        try:
            updated_reply = await ReplyCrud.update_by_id(db, reply_id, reply_data)
            await db.commit()
            await db.refresh(updated_reply)
            return await ReplyService._build_reply_read(db, updated_reply, user_id)
        except Exception:
            await db.rollback()
            raise

    @staticmethod
    async def delete_by_id(db: AsyncSession, reply_id: int, user_id: int) -> ReplyRead:
        reply = await ReplyCrud.get_by_id(db, reply_id)
        if not reply:
            raise HTTPException(status_code=404, detail="Reply not found")
        if reply.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not your reply")
        try:
            await LikeCrud.delete_reply_likes_by_reply_id(db, reply_id)
            deleted = await ReplyCrud.delete_by_id(db, reply_id)

            # If parent comment was soft-deleted and now has no replies, hard delete it.
            remaining = await ReplyCrud.count_by_comment_id(db, reply.comment_id)
            if remaining == 0:
                parent_comment = await CommentCrud.get_by_id(db, reply.comment_id)
                if parent_comment and getattr(parent_comment, "is_deleted", False):
                    await CommentCrud.delete_by_id(db, parent_comment.comment_id)

            await db.commit()
            return await ReplyService._build_reply_read(db, deleted, user_id)
        except Exception:
            await db.rollback()
            raise

    @staticmethod
    async def get_all_by_comment_id(
        db: AsyncSession, comment_id: int, user_id: int | None = None
    ) -> list[ReplyRead]:
        replies = await ReplyCrud.get_all_by_comment_id(db, comment_id)
        built = [await ReplyService._build_reply_read(db, r, user_id) for r in replies]
        return ReplyService._build_reply_tree(built)

    @staticmethod
    async def get_all_by_comment_ids(
        db: AsyncSession, comment_ids: list[int], user_id: int | None = None
    ) -> dict[int, list[ReplyRead]]:
        replies = await ReplyCrud.get_all_by_comment_ids(db, comment_ids)
        reply_ids = [reply.reply_id for reply in replies]
        reply_user_ids = list({reply.user_id for reply in replies})
        like_counts = await LikeCrud.count_reply_likes_by_reply_ids(db, reply_ids)
        reply_users = await UserCrud.get_by_ids(db, reply_user_ids)
        built_by_comment_id: dict[int, list[ReplyRead]] = {
            comment_id: [] for comment_id in comment_ids
        }

        for reply in replies:
            built_by_comment_id.setdefault(reply.comment_id, []).append(
                await ReplyService._build_reply_read(
                    db,
                    reply,
                    user_id,
                    like_count=like_counts.get(reply.reply_id, 0),
                    username=reply_users[reply.user_id].username,
                )
            )

        return {
            comment_id: ReplyService._build_reply_tree(built)
            for comment_id, built in built_by_comment_id.items()
        }

    @staticmethod
    def _build_reply_tree(built: list[ReplyRead]) -> list[ReplyRead]:
        # Build nested tree using parent_reply_id
        reply_map: dict[int, ReplyRead] = {r.reply_id: r for r in built}
        roots: list[ReplyRead] = []
        for r in built:
            if r.parent_reply_id and r.parent_reply_id in reply_map:
                reply_map[r.parent_reply_id].replies.append(r)
            else:
                roots.append(r)
        return roots

    @staticmethod
    async def _build_reply_read(
        db: AsyncSession,
        reply: Reply,
        user_id: int | None = None,
        like_count: int | None = None,
        username: str | None = None,
    ) -> ReplyRead:
        reply_username = username
        if reply_username is None:
            user = await UserCrud.get_by_id(db=db, user_id=reply.user_id)
            reply_username = user.username
        reply_like_count = (
            like_count
            if like_count is not None
            else await LikeCrud.count_reply_likes(db, reply.reply_id)
        )
        has_liked = await LikeCrud.has_user_liked_reply(db, reply.reply_id, user_id) if user_id else False


        return ReplyRead(
            **reply.__dict__,
            username=reply_username,
            like_count=reply_like_count,
            has_liked=has_liked,
        )
