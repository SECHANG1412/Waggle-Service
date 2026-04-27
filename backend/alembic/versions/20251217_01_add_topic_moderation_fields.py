"""Add topic moderation fields

Revision ID: 20251217_01_add_topic_moderation_fields
Revises: 20251216_01_add_admin_action_logs
Create Date: 2025-12-17
"""

from alembic import op
import sqlalchemy as sa


revision = "20251217_01_add_topic_moderation_fields"
down_revision = "20251216_01_add_admin_action_logs"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "topics",
        sa.Column("is_hidden", sa.Boolean(), server_default=sa.false(), nullable=False),
    )
    op.add_column("topics", sa.Column("hidden_at", sa.TIMESTAMP(), nullable=True))
    op.add_column("topics", sa.Column("hidden_by", sa.Integer(), nullable=True))
    op.create_foreign_key(
        "fk_topics_hidden_by_users",
        "topics",
        "users",
        ["hidden_by"],
        ["user_id"],
    )
    op.create_index("ix_topics_hidden_created_at", "topics", ["is_hidden", "created_at"])


def downgrade() -> None:
    op.drop_index("ix_topics_hidden_created_at", table_name="topics")
    op.drop_constraint("fk_topics_hidden_by_users", "topics", type_="foreignkey")
    op.drop_column("topics", "hidden_by")
    op.drop_column("topics", "hidden_at")
    op.drop_column("topics", "is_hidden")
