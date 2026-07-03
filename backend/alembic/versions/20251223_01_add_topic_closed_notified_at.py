"""Add topic closed notification tracking

Revision ID: 20251223_01_add_topic_closed_notified_at
Revises: 20251222_01_add_notifications
Create Date: 2025-12-23
"""

from alembic import op
import sqlalchemy as sa


revision = "20251223_01_add_topic_closed_notified_at"
down_revision = "20251222_01_add_notifications"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "topics",
        sa.Column("closed_notified_at", sa.TIMESTAMP(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("topics", "closed_notified_at")