from __future__ import annotations
from datetime import datetime
from sqlalchemy import ForeignKey, TIMESTAMP, func, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base


class TopicLike(Base):
    __tablename__ = "topic_likes"

    like_id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.user_id"), nullable=False)
    topic_id: Mapped[int] = mapped_column(ForeignKey("topics.topic_id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP, server_default=func.now(), nullable=False
    )

    __table_args__ = (
        UniqueConstraint("user_id", "topic_id", name="unique_topic_like"),
    )
    topic: Mapped["Topic"] = relationship("Topic", back_populates="likes")
    user: Mapped["User"] = relationship("User", back_populates="topic_likes")



class CommentLike(Base):
    __tablename__ = "comment_likes"

    like_id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.user_id"), nullable=False)
    comment_id: Mapped[int] = mapped_column(
        ForeignKey("comments.comment_id"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP, server_default=func.now(), nullable=False
    )

    __table_args__ = (
        UniqueConstraint("user_id", "comment_id", name="unique_comment_like"),
    )
    comment: Mapped["Comment"] = relationship("Comment", back_populates="likes")
    user: Mapped["User"] = relationship("User", back_populates="comment_likes")



class ReplyLike(Base):
    __tablename__ = "reply_likes"

    like_id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.user_id"), nullable=False)
    reply_id: Mapped[int] = mapped_column(
        ForeignKey("replies.reply_id"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP, server_default=func.now(), nullable=False
    )

    __table_args__ = (
        UniqueConstraint("user_id", "reply_id", name="unique_reply_like"),
    )
    reply: Mapped["Reply"] = relationship("Reply", back_populates="likes")
    user: Mapped["User"] = relationship("User", back_populates="reply_likes")
