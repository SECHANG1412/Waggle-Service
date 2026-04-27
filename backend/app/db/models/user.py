from __future__ import annotations
from datetime import datetime
from typing import Optional, List
from sqlalchemy import Boolean, String, TIMESTAMP, false, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base


class User(Base):
    __tablename__ = "users"

    user_id: Mapped[int] = mapped_column(primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    email: Mapped[str] = mapped_column(
        String(100), unique=True, index=True, nullable=False
    )
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    is_admin: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default=false()
    )
    refresh_token: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_at: Mapped[Optional[datetime]] = mapped_column(
        TIMESTAMP, server_default=func.now(), nullable=True
    )

    topics: Mapped[List["Topic"]] = relationship(
        "Topic",
        back_populates="user",
        cascade="all, delete-orphan",
        foreign_keys="Topic.user_id",
    )
    votes: Mapped[list["Vote"]] = relationship(
        "Vote", back_populates="user", cascade="all, delete-orphan"
    )
    comments: Mapped[list["Comment"]] = relationship(
        "Comment", back_populates="user", cascade="all, delete-orphan"
    )
    replies: Mapped[List["Reply"]] = relationship(
        "Reply", back_populates="user", cascade="all, delete-orphan"
    )
    topic_likes: Mapped[List["TopicLike"]] = relationship(
        "TopicLike", back_populates="user", cascade="all, delete-orphan"
    )
    comment_likes: Mapped[List["CommentLike"]] = relationship(
        "CommentLike", back_populates="user", cascade="all, delete-orphan"
    )
    reply_likes: Mapped[List["ReplyLike"]] = relationship(
        "ReplyLike", back_populates="user", cascade="all, delete-orphan"
    )
