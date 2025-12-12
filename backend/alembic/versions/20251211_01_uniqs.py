"""Add unique constraints for username and vote user-topic

Revision ID: 20251211_01_uniqs
Revises: 20251210_00_init
Create Date: 2025-12-11
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "20251211_01_uniqs"
down_revision = "20251210_00_init"
branch_labels = None
depends_on = None


def _drop_index_if_exists(table: str, index: str):
    # Deprecated: dropping FK-backed index can fail; keep for reference if needed.
    pass


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


def upgrade() -> None:
    # 이미 동일 이름/열 조합의 인덱스가 있으면 생성 생략
    if not _index_exists("users", "uq_users_username"):
        op.create_unique_constraint("uq_users_username", "users", ["username"])

    if not _index_exists("votes", "unique_vote_user_topic"):
        op.create_unique_constraint(
            "unique_vote_user_topic",
            "votes",
            ["user_id", "topic_id"],
        )


def downgrade() -> None:
    op.drop_constraint("unique_vote_user_topic", "votes", type_="unique")
    op.drop_constraint("uq_users_username", "users", type_="unique")
