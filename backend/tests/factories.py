from __future__ import annotations

from datetime import datetime, timezone
from itertools import count
from typing import Iterable

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import Comment, Reply, Topic, TopicLike, User, Vote

_seq = count(1)


def _next_seq() -> int:
    return next(_seq)


async def create_user(
    db: AsyncSession,
    *,
    username: str | None = None,
    email: str | None = None,
    password: str = "hashed-password",
    is_admin: bool = False,
) -> User:
    idx = _next_seq()
    user = User(
        username=username or f"user{idx}",
        email=email or f"user{idx}@example.com",
        password=password,
        is_admin=is_admin,
    )
    db.add(user)
    await db.flush()
    return user


async def create_topic(
    db: AsyncSession,
    *,
    user_id: int,
    title: str | None = None,
    description: str = "desc",
    category: str = "general",
    vote_options: Iterable[str] | None = None,
    created_at: datetime | None = None,
) -> Topic:
    idx = _next_seq()
    topic = Topic(
        user_id=user_id,
        title=title or f"topic-{idx}",
        description=description,
        category=category,
        vote_options=list(vote_options or ["A", "B"]),
    )
    if created_at:
        topic.created_at = created_at.astimezone(timezone.utc)
    db.add(topic)
    await db.flush()
    return topic


async def create_vote(
    db: AsyncSession,
    *,
    user_id: int,
    topic_id: int,
    vote_index: int = 0,
    created_at: datetime | None = None,
) -> Vote:
    vote = Vote(user_id=user_id, topic_id=topic_id, vote_index=vote_index)
    if created_at:
        vote.created_at = created_at.astimezone(timezone.utc)
    db.add(vote)
    await db.flush()
    return vote


async def create_topic_like(
    db: AsyncSession,
    *,
    user_id: int,
    topic_id: int,
) -> TopicLike:
    like = TopicLike(user_id=user_id, topic_id=topic_id)
    db.add(like)
    await db.flush()
    return like


async def create_comment(
    db: AsyncSession,
    *,
    user_id: int,
    topic_id: int,
    content: str = "comment",
    is_deleted: bool = False,
) -> Comment:
    comment = Comment(
        user_id=user_id,
        topic_id=topic_id,
        content=content,
        is_deleted=is_deleted,
    )
    db.add(comment)
    await db.flush()
    return comment


async def create_reply(
    db: AsyncSession,
    *,
    user_id: int,
    comment_id: int,
    content: str = "reply",
    parent_reply_id: int | None = None,
) -> Reply:
    reply = Reply(
        user_id=user_id,
        comment_id=comment_id,
        content=content,
        parent_reply_id=parent_reply_id,
    )
    db.add(reply)
    await db.flush()
    return reply
