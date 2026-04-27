"""Add comment moderation fields

Revision ID: 20251218_01_add_comment_moderation_fields
Revises: 20251217_01_add_topic_moderation_fields
Create Date: 2025-12-18
"""

from alembic import op
import sqlalchemy as sa

revision = "20251218_01_add_comment_moderation_fields"
down_revision = "20251217_01_add_topic_moderation_fields"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "comments",
        sa.Column("is_hidden", sa.Boolean(), server_default=sa.false(), nullable=False),
    )
    op.add_column("comments", sa.Column("hidden_at", sa.TIMESTAMP(), nullable=True))
    op.add_column("comments", sa.Column("hidden_by", sa.Integer(), nullable=True))
    op.create_foreign_key(
        "fk_comments_hidden_by_users",
        "comments",
        "users",
        ["hidden_by"],
        ["user_id"],
    )
    op.create_index(
        "ix_comments_topic_hidden_created_at",
        "comments",
        ["topic_id", "is_hidden", "created_at"],
    )


def downgrade() -> None:
    op.drop_index("ix_comments_topic_hidden_created_at", table_name="comments")
    op.drop_constraint("fk_comments_hidden_by_users", "comments", type_="foreignkey")
    op.drop_column("comments", "hidden_by")
    op.drop_column("comments", "hidden_at")
    op.drop_column("comments", "is_hidden")
