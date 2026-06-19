"""Add topic expiration timestamp

Revision ID: 20251221_01_add_topic_expires_at
Revises: 20251220_01_add_username_normalized
Create Date: 2025-12-21
"""

from alembic import op
import sqlalchemy as sa


revision = "20251221_01_add_topic_expires_at"
down_revision = "20251220_01_add_username_normalized"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("topics", sa.Column("expires_at", sa.TIMESTAMP(), nullable=True))
    op.create_index("ix_topics_expires_at", "topics", ["expires_at"])


def downgrade() -> None:
    op.drop_index("ix_topics_expires_at", table_name="topics")
    op.drop_column("topics", "expires_at")
