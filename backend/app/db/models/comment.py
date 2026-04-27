from __future__ import annotations
from datetime import datetime
from typing import List
from sqlalchemy import Boolean, ForeignKey, String, TIMESTAMP, false, func, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base


class Comment(Base):
    __tablename__ = "comments"
    __table_args__ = (
        Index("ix_comments_topic_deleted", "topic_id", "is_deleted"),
        Index("ix_comments_topic_hidden_created_at", "topic_id", "is_hidden", "created_at"),
    )

    comment_id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.user_id"), nullable=False)
    topic_id: Mapped[int] = mapped_column(ForeignKey("topics.topic_id"), nullable=False)
    content: Mapped[str] = mapped_column(String(500), nullable=False)
    is_deleted: Mapped[bool] = mapped_column(default=False, server_default="0")
    is_hidden: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default=false()
    )
    hidden_at: Mapped[datetime | None] = mapped_column(TIMESTAMP, nullable=True)
    hidden_by: Mapped[int | None] = mapped_column(
        ForeignKey("users.user_id"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP, server_default=func.now(), nullable=False
    )

    topic: Mapped["Topic"] = relationship("Topic", back_populates="comments")
    user: Mapped["User"] = relationship(
        "User", back_populates="comments", foreign_keys=[user_id]
    )
    replies: Mapped[List["Reply"]] = relationship(
        "Reply", back_populates="comment", cascade="all, delete-orphan"
    )
    likes: Mapped[List["CommentLike"]] = relationship(
        "CommentLike", back_populates="comment", cascade="all, delete-orphan"
    )
