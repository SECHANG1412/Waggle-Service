from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.crud import TopicCrud, VoteCrud, LikeCrud, PinnedTopicCrud, CommentCrud, ReplyCrud
from app.db.schemas.topics import TopicCreate, TopicModerationUpdate, TopicRead
from app.db.models import Topic
from app.services.admin_action_log import AdminActionLogService

class TopicService:
    @staticmethod
    async def create(db:AsyncSession, user_id: int, topic_data: TopicCreate) -> TopicRead:
        try:
            db_topic = await TopicCrud.create(db, topic_data, user_id)
            await db.commit()
            await db.refresh(db_topic)
            public_topic = await TopicCrud.get_public_by_id(db, db_topic.topic_id)
            return await TopicService._build_topic_read(db, public_topic, user_id)
        except Exception:
            await db.rollback()
            raise
    
    @staticmethod
    async def get_by_id(db: AsyncSession, topic_id: int, user_id: int | None) -> TopicRead | None:
        db_topic = await TopicCrud.get_public_by_id(db, topic_id)
        if not db_topic:
            raise HTTPException(status_code=404, detail="Topic not found")
        return await TopicService._build_topic_read(db, db_topic, user_id)
    
    @staticmethod
    async def get_all(
        db:AsyncSession,
        search: str | None = None,
        category: str | None = None,
        sort: str = "created_at",
        limit: int = 10,
        offset: int = 0,
        user_id: int | None = None
    ) -> list[TopicRead]:
        db_topics = await TopicCrud.get_all_with_filters(db,search,category,sort,limit,offset)
        topic_ids = [topic.topic_id for topic in db_topics]
        pinned_map: dict[int, int] = {}
        pinned_topic_ids: set[int] = set()
        if user_id is not None:
            pinned = await PinnedTopicCrud.list_by_user(db, user_id)
            pinned_map = {p.topic_id: idx for idx, p in enumerate(pinned)}
            pinned_topic_ids = {p.topic_id for p in pinned}
        vote_counts_by_topic = await VoteCrud.get_vote_counts_by_topic_ids(db, topic_ids)
        like_counts = await LikeCrud.count_topic_likes_by_topic_ids(db, topic_ids)
        comment_counts = await CommentCrud.count_active_by_topic_ids(db, topic_ids)
        reply_counts = await ReplyCrud.count_by_topic_ids(db, topic_ids)

        topic_reads = [
            await TopicService._build_topic_read(
                db,
                db_topic,
                user_id,
                vote_counts=vote_counts_by_topic.get(db_topic.topic_id, {}),
                like_count=like_counts.get(db_topic.topic_id, 0),
                comment_count=comment_counts.get(db_topic.topic_id, 0),
                reply_count=reply_counts.get(db_topic.topic_id, 0),
                is_pinned=db_topic.topic_id in pinned_topic_ids,
            )
            for db_topic in db_topics
        ]

        if pinned_map:
            topic_reads.sort(key=lambda t: pinned_map.get(t.topic_id, 10**9))

        return topic_reads
    
    @staticmethod
    async def count_total(db:AsyncSession, category: str | None, search: str | None) -> int:
        return await TopicCrud.count_all_with_filters(db, category, search)

    @staticmethod
    async def get_all_for_admin(
        db: AsyncSession,
        *,
        status: str | None = None,
        start_at=None,
        end_at=None,
    ) -> list[Topic]:
        return await TopicCrud.get_all_for_admin(
            db,
            status=status,
            start_at=start_at,
            end_at=end_at,
        )

    @staticmethod
    async def hide_for_admin(
        db: AsyncSession,
        topic_id: int,
        update: TopicModerationUpdate,
        admin_user_id: int,
    ) -> Topic:
        topic = await TopicCrud.get_by_id(db, topic_id)
        if not topic:
            raise HTTPException(status_code=404, detail="Topic not found")

        before_value = {
            "is_hidden": topic.is_hidden,
            "hidden_by": topic.hidden_by,
        }
        try:
            updated = await TopicCrud.hide(db, topic, admin_user_id)
            await AdminActionLogService.record(
                db,
                admin_user_id=admin_user_id,
                action="HIDE_TOPIC",
                target_type="Topic",
                target_id=topic_id,
                before_value=before_value,
                after_value={
                    "is_hidden": True,
                    "hidden_by": admin_user_id,
                },
                reason=update.reason,
            )
            await db.commit()
            await db.refresh(updated)
            return updated
        except Exception:
            await db.rollback()
            raise

    @staticmethod
    async def unhide_for_admin(
        db: AsyncSession,
        topic_id: int,
        update: TopicModerationUpdate,
        admin_user_id: int,
    ) -> Topic:
        topic = await TopicCrud.get_by_id(db, topic_id)
        if not topic:
            raise HTTPException(status_code=404, detail="Topic not found")

        before_value = {
            "is_hidden": topic.is_hidden,
            "hidden_by": topic.hidden_by,
        }
        try:
            updated = await TopicCrud.unhide(db, topic)
            await AdminActionLogService.record(
                db,
                admin_user_id=admin_user_id,
                action="UNHIDE_TOPIC",
                target_type="Topic",
                target_id=topic_id,
                before_value=before_value,
                after_value={
                    "is_hidden": False,
                    "hidden_by": None,
                },
                reason=update.reason,
            )
            await db.commit()
            await db.refresh(updated)
            return updated
        except Exception:
            await db.rollback()
            raise

    @staticmethod
    async def delete_for_admin(
        db: AsyncSession,
        topic_id: int,
        update: TopicModerationUpdate,
        admin_user_id: int,
    ) -> Topic:
        topic = await TopicCrud.get_by_id(db, topic_id)
        if not topic:
            raise HTTPException(status_code=404, detail="Topic not found")

        before_value = {
            "is_hidden": topic.is_hidden,
            "hidden_by": topic.hidden_by,
        }
        try:
            updated = await TopicCrud.hide(db, topic, admin_user_id)
            await AdminActionLogService.record(
                db,
                admin_user_id=admin_user_id,
                action="DELETE_TOPIC",
                target_type="Topic",
                target_id=topic_id,
                before_value=before_value,
                after_value={
                    "is_hidden": True,
                    "hidden_by": admin_user_id,
                },
                reason=update.reason,
            )
            await db.commit()
            await db.refresh(updated)
            return updated
        except Exception:
            await db.rollback()
            raise

    @staticmethod
    async def restore_for_admin(
        db: AsyncSession,
        topic_id: int,
        update: TopicModerationUpdate,
        admin_user_id: int,
    ) -> Topic:
        topic = await TopicCrud.get_by_id(db, topic_id)
        if not topic:
            raise HTTPException(status_code=404, detail="Topic not found")
        if not topic.is_hidden:
            raise HTTPException(status_code=400, detail="Topic is not deleted")

        before_value = {
            "is_hidden": topic.is_hidden,
            "hidden_by": topic.hidden_by,
        }
        try:
            updated = await TopicCrud.unhide(db, topic)
            await AdminActionLogService.record(
                db,
                admin_user_id=admin_user_id,
                action="RESTORE_TOPIC",
                target_type="Topic",
                target_id=topic_id,
                before_value=before_value,
                after_value={
                    "is_hidden": False,
                    "hidden_by": None,
                },
                reason=update.reason,
            )
            await db.commit()
            await db.refresh(updated)
            return updated
        except Exception:
            await db.rollback()
            raise

    @staticmethod
    async def delete(db: AsyncSession, topic_id: int, user_id: int) -> bool:
        topic = await TopicCrud.get_by_id(db, topic_id)
        if not topic:
            raise HTTPException(status_code=404, detail="Topic not found")
        if topic.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not your topic")
        try:
            await PinnedTopicCrud.unpin_by_topic(db, topic_id)
            deleted = await TopicCrud.delete_by_id(db, topic_id)
            await db.commit()
            return deleted
        except Exception:
            await db.rollback()
            raise
    
    @staticmethod
    async def _build_topic_read(
        db: AsyncSession,
        topic: Topic,
        user_id: int | None = None,
        vote_counts: dict[int, int] | None = None,
        like_count: int | None = None,
        comment_count: int | None = None,
        reply_count: int | None = None,
        is_pinned: bool = False,
    ) -> TopicRead:
        if vote_counts is None:
            vote_counts = await VoteCrud.get_vote_counts_by_topic_id(db, topic.topic_id)
        if like_count is None:
            like_count = await LikeCrud.count_topic_likes(db, topic.topic_id)
        if comment_count is None:
            comment_count = await CommentCrud.count_active_by_topic_id(db, topic.topic_id)
        if reply_count is None:
            reply_count = await ReplyCrud.count_by_topic_id(db, topic.topic_id)

        vote_results = [0] * len(topic.vote_options)
        for vote_index, count in vote_counts.items():
            if 0 <= vote_index < len(vote_results):
                vote_results[vote_index] = count

        result = TopicRead(
            **topic.__dict__,
            author_name=topic.user.username if topic.user else None,
            vote_results=vote_results,
            total_vote=sum(vote_counts.values()),
            like_count=like_count,
            comment_count=comment_count + reply_count)

        if user_id is not None:
            vote = await VoteCrud.get_by_topic_and_user(db, topic.topic_id, user_id)
            result.has_voted = vote is not None
            result.user_vote_index = vote.vote_index if vote else None
            result.has_liked = await LikeCrud.has_user_liked_topic(
                db, topic.topic_id, user_id
            )

        if user_id is not None:
            result.is_pinned = is_pinned

        return result
