from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.crud import NotificationCrud, PinnedTopicCrud, TopicCrud, VoteCrud
from app.db.schemas.notifications import (
    ClosedTopicNotificationDispatchResponse,
    NotificationCreate,
    NotificationRead,
    NotificationReadAllResponse,
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
    def _closed_topic_notification_targets(
        *,
        author_user_id: int,
        voter_user_ids: set[int],
        pinned_user_ids: set[int],
    ) -> list[tuple[int, str, str]]:
        targets: list[tuple[int, str, str]] = [
            (
                author_user_id,
                "topic_closed_author",
                "내가 만든 투표가 마감되었습니다. 결과를 확인해보세요.",
            )
        ]
        notified_user_ids = {author_user_id}

        for user_id in sorted(voter_user_ids - notified_user_ids):
            targets.append(
                (
                    user_id,
                    "topic_closed_voter",
                    "참여한 투표가 마감되었습니다. 결과를 확인해보세요.",
                )
            )
            notified_user_ids.add(user_id)

        for user_id in sorted(pinned_user_ids - notified_user_ids):
            targets.append(
                (
                    user_id,
                    "topic_closed_pinned",
                    "북마크한 투표가 마감되었습니다. 결과를 확인해보세요.",
                )
            )
            notified_user_ids.add(user_id)

        return targets

    @staticmethod
    async def dispatch_closed_topic_notifications(
        db: AsyncSession,
        *,
        now: datetime | None = None,
        limit: int = 100,
    ) -> ClosedTopicNotificationDispatchResponse:
        current_time = now or datetime.now(timezone.utc)
        topics = await TopicCrud.get_closed_without_notifications(
            db, now=current_time, limit=limit
        )
        topic_ids = [topic.topic_id for topic in topics]
        voter_user_ids_by_topic = await VoteCrud.get_user_ids_by_topic_ids(db, topic_ids)
        pinned_user_ids_by_topic = await PinnedTopicCrud.get_user_ids_by_topic_ids(
            db, topic_ids
        )

        created_count = 0
        try:
            for topic in topics:
                targets = NotificationService._closed_topic_notification_targets(
                    author_user_id=topic.user_id,
                    voter_user_ids=voter_user_ids_by_topic.get(topic.topic_id, set()),
                    pinned_user_ids=pinned_user_ids_by_topic.get(topic.topic_id, set()),
                )
                for user_id, notification_type, message in targets:
                    await NotificationService.create(
                        db,
                        NotificationCreate(
                            user_id=user_id,
                            type=notification_type,
                            actor_user_id=None,
                            target_type="Topic",
                            target_id=topic.topic_id,
                            topic_id=topic.topic_id,
                            message=message,
                            link=f"/topic/{topic.topic_id}?focus=results",
                        ),
                    )
                    created_count += 1
                await TopicCrud.mark_closed_notified(
                    db, topic, notified_at=current_time
                )
            await db.commit()
            return ClosedTopicNotificationDispatchResponse(
                processed_topics=len(topics),
                created_notifications=created_count,
            )
        except Exception:
            await db.rollback()
            raise

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
    async def mark_all_as_read(
        db: AsyncSession, user_id: int
    ) -> NotificationReadAllResponse:
        try:
            updated_count = await NotificationCrud.mark_all_as_read(db, user_id)
            await db.commit()
            return NotificationReadAllResponse(updated_count=updated_count)
        except Exception:
            await db.rollback()
            raise
