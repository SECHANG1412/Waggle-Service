"""Merge heads after adding uniques

Revision ID: 20251211_02_merge
Revises: 20251206_02, 20251211_01_uniqs
Create Date: 2025-12-11
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "20251211_02_merge"
down_revision = ("20251206_02", "20251211_01_uniqs")
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
