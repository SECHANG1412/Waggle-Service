"""Add normalized username uniqueness

Revision ID: 20251220_01_add_username_normalized
Revises: 20251219_01_add_inquiry_user_id
Create Date: 2025-12-20
"""

from alembic import op
import sqlalchemy as sa


revision = "20251220_01_add_username_normalized"
down_revision = "20251219_01_add_inquiry_user_id"
branch_labels = None
depends_on = None


def _index_exists(table: str, index: str) -> bool:
    bind = op.get_bind()
    exists = bind.execute(
        sa.text(
            """
            SELECT COUNT(1) FROM information_schema.statistics
            WHERE table_schema = DATABASE()
              AND table_name = :table
              AND index_name = :index
            """
        ),
        {"table": table, "index": index},
    ).scalar()
    return bool(exists)


def _has_duplicate_normalized_usernames() -> bool:
    bind = op.get_bind()
    duplicate = bind.execute(
        sa.text(
            """
            SELECT LOWER(TRIM(username)) AS normalized_username
            FROM users
            GROUP BY normalized_username
            HAVING COUNT(*) > 1
            LIMIT 1
            """
        )
    ).first()
    return duplicate is not None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("username_normalized", sa.String(length=50), nullable=True),
    )
    op.execute("UPDATE users SET username_normalized = LOWER(TRIM(username))")

    if _has_duplicate_normalized_usernames():
        raise RuntimeError(
            "Duplicate usernames exist after trimming/lowercasing. "
            "Resolve duplicate users before applying this migration."
        )

    op.alter_column(
        "users",
        "username_normalized",
        existing_type=sa.String(length=50),
        nullable=False,
    )

    if not _index_exists("users", "uq_users_username_normalized"):
        op.create_unique_constraint(
            "uq_users_username_normalized",
            "users",
            ["username_normalized"],
        )


def downgrade() -> None:
    op.drop_constraint("uq_users_username_normalized", "users", type_="unique")
    op.drop_column("users", "username_normalized")
