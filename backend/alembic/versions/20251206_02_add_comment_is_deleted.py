"""Add is_deleted to comments for soft delete

Revision ID: 20251206_02
Revises: 20251206_01
Create Date: 2025-12-06
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "20251206_02"
down_revision = "20251206_01"
branch_labels = None
depends_on = None


def upgrade():
  bind = op.get_bind()
  exists = bind.execute(
      sa.text(
          """
          SELECT COUNT(1)
          FROM information_schema.columns
          WHERE table_schema = DATABASE()
            AND table_name = 'comments'
            AND column_name = 'is_deleted'
          """
      )
  ).scalar()
  if exists:
      return

  op.add_column(
      "comments",
      sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default=sa.text("0")),
  )


def downgrade():
  op.drop_column("comments", "is_deleted")
