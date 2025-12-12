"""Set topic category default to '자유' and migrate 기존 '기타' 값

Revision ID: 20251212_01_update_topic_category_default
Revises: 20251211_02_merge
Create Date: 2025-12-12
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "20251212_01_update_topic_category_default"
down_revision = "20251211_02_merge"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 기존 '기타' 또는 NULL/빈 값은 '자유'로 통일
    op.execute(
        """
        UPDATE topics
        SET category = '자유'
        WHERE category IS NULL OR category = '' OR category = '기타'
        """
    )
    op.alter_column(
        "topics",
        "category",
        existing_type=sa.String(length=255),
        server_default=sa.text("'자유'"),
        existing_nullable=False,
    )


def downgrade() -> None:
    # 기본값을 '기타'로 되돌림 (데이터는 그대로 둠)
    op.alter_column(
        "topics",
        "category",
        existing_type=sa.String(length=255),
        server_default=sa.text("'기타'"),
        existing_nullable=False,
    )
