"""Add inquiries

Revision ID: 20251214_01_add_inquiries
Revises: 20251213_01_add_topics_read_indexes
Create Date: 2025-12-14
"""

from alembic import op
import sqlalchemy as sa


revision = "20251214_01_add_inquiries"
down_revision = "20251213_01_add_topics_read_indexes"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "inquiries",
        sa.Column("inquiry_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=50), nullable=False),
        sa.Column("email", sa.String(length=100), nullable=False),
        sa.Column("title", sa.String(length=150), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("status", sa.String(length=20), server_default="pending", nullable=False),
        sa.Column("created_at", sa.TIMESTAMP(), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.TIMESTAMP(), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("inquiry_id"),
    )
    op.create_index(op.f("ix_inquiries_inquiry_id"), "inquiries", ["inquiry_id"])
    op.create_index(op.f("ix_inquiries_email"), "inquiries", ["email"])


def downgrade() -> None:
    op.drop_index(op.f("ix_inquiries_email"), table_name="inquiries")
    op.drop_index(op.f("ix_inquiries_inquiry_id"), table_name="inquiries")
    op.drop_table("inquiries")
