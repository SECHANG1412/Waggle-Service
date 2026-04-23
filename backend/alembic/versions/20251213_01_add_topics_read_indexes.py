"""Add indexes for topics read path

Revision ID: 20251213_01_add_topics_read_indexes
Revises: 20251212_01_update_topic_category_default
Create Date: 2025-12-13
"""

from alembic import op


revision = "20251213_01_add_topics_read_indexes"
down_revision = "20251212_01_update_topic_category_default"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_index("ix_topics_created_at", "topics", ["created_at"])
    op.create_index(
        "ix_topics_category_created_at",
        "topics",
        ["category", "created_at"],
    )
    op.create_index(
        "ix_votes_topic_vote_index",
        "votes",
        ["topic_id", "vote_index"],
    )
    op.create_index(
        "ix_comments_topic_deleted",
        "comments",
        ["topic_id", "is_deleted"],
    )
    op.create_index("ix_replies_comment_id", "replies", ["comment_id"])
    op.create_index("ix_topic_likes_topic_id", "topic_likes", ["topic_id"])
    op.create_index(
        "ix_pinned_topics_user_pinned_at",
        "pinned_topics",
        ["user_id", "pinned_at"],
    )


def downgrade() -> None:
    op.drop_index("ix_pinned_topics_user_pinned_at", table_name="pinned_topics")
    op.drop_index("ix_topic_likes_topic_id", table_name="topic_likes")
    op.drop_index("ix_replies_comment_id", table_name="replies")
    op.drop_index("ix_comments_topic_deleted", table_name="comments")
    op.drop_index("ix_votes_topic_vote_index", table_name="votes")
    op.drop_index("ix_topics_category_created_at", table_name="topics")
    op.drop_index("ix_topics_created_at", table_name="topics")
