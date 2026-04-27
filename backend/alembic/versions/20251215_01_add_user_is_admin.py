"""Add user is_admin flag

Revision ID: 20251215_01_add_user_is_admin
Revises: 20251214_01_add_inquiries
Create Date: 2025-12-15
"""

from alembic import op
import sqlalchemy as sa


revision = "20251215_01_add_user_is_admin"
down_revision = "20251214_01_add_inquiries"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("is_admin", sa.Boolean(), server_default=sa.false(), nullable=False),
    )


def downgrade() -> None:
    op.drop_column("users", "is_admin")
