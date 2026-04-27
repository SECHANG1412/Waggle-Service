"""Add admin action logs

Revision ID: 20251216_01_add_admin_action_logs
Revises: 20251215_01_add_user_is_admin
Create Date: 2025-12-16
"""

from alembic import op
import sqlalchemy as sa


revision = "20251216_01_add_admin_action_logs"
down_revision = "20251215_01_add_user_is_admin"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "admin_action_logs",
        sa.Column("log_id", sa.Integer(), nullable=False),
        sa.Column("admin_user_id", sa.Integer(), nullable=False),
        sa.Column("action", sa.String(length=50), nullable=False),
        sa.Column("target_type", sa.String(length=50), nullable=False),
        sa.Column("target_id", sa.Integer(), nullable=False),
        sa.Column("before_value", sa.JSON(), nullable=False),
        sa.Column("after_value", sa.JSON(), nullable=False),
        sa.Column("reason", sa.Text(), nullable=False),
        sa.Column("created_at", sa.TIMESTAMP(), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["admin_user_id"], ["users.user_id"]),
        sa.PrimaryKeyConstraint("log_id"),
    )
    op.create_index(op.f("ix_admin_action_logs_log_id"), "admin_action_logs", ["log_id"])
    op.create_index(
        op.f("ix_admin_action_logs_admin_user_id"),
        "admin_action_logs",
        ["admin_user_id"],
    )
    op.create_index(op.f("ix_admin_action_logs_action"), "admin_action_logs", ["action"])
    op.create_index(
        op.f("ix_admin_action_logs_target_type"),
        "admin_action_logs",
        ["target_type"],
    )
    op.create_index(
        op.f("ix_admin_action_logs_target_id"),
        "admin_action_logs",
        ["target_id"],
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_admin_action_logs_target_id"), table_name="admin_action_logs")
    op.drop_index(op.f("ix_admin_action_logs_target_type"), table_name="admin_action_logs")
    op.drop_index(op.f("ix_admin_action_logs_action"), table_name="admin_action_logs")
    op.drop_index(
        op.f("ix_admin_action_logs_admin_user_id"), table_name="admin_action_logs"
    )
    op.drop_index(op.f("ix_admin_action_logs_log_id"), table_name="admin_action_logs")
    op.drop_table("admin_action_logs")
