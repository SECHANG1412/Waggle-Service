from __future__ import annotations

from datetime import datetime, timezone
from itertools import count
from typing import Iterable

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import Topic, TopicLike, User, Vote

_seq = count(1)


def _next_seq() -> int:
    return next(_seq)


async def create_user(
    db: AsyncSession,
    *,
    username: str | None = None,
    email: str | None = None,
    password: str = "hashed-password",
) -> User:
    idx = _next_seq()
    user = User(
        username=username or f"user{idx}",
        email=email or f"user{idx}@example.com",
        password=password,
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
