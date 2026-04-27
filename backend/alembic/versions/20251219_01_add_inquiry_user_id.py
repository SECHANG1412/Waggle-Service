"""Add user_id to inquiries

Revision ID: 20251219_01_add_inquiry_user_id
Revises: 20251218_01_add_comment_moderation_fields
Create Date: 2025-12-19
"""

from alembic import op
import sqlalchemy as sa


revision = "20251219_01_add_inquiry_user_id"
down_revision = "20251218_01_add_comment_moderation_fields"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("inquiries", sa.Column("user_id", sa.Integer(), nullable=True))
    op.create_index(op.f("ix_inquiries_user_id"), "inquiries", ["user_id"])
    op.create_foreign_key(
        "fk_inquiries_user_id_users",
        "inquiries",
        "users",
        ["user_id"],
        ["user_id"],
    )


def downgrade() -> None:
    op.drop_constraint("fk_inquiries_user_id_users", "inquiries", type_="foreignkey")
    op.drop_index(op.f("ix_inquiries_user_id"), table_name="inquiries")
    op.drop_column("inquiries", "user_id")
