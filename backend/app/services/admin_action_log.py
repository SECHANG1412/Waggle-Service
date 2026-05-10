from sqlalchemy.ext.asyncio import AsyncSession

from app.db.crud import AdminActionLogCrud
from app.db.models import AdminActionLog


class AdminActionLogService:
    @staticmethod
    async def record(
        db: AsyncSession,
        *,
        admin_user_id: int,
        action: str,
        target_type: str,
        target_id: int,
        before_value: dict,
        after_value: dict,
        reason: str,
    ) -> AdminActionLog:
        return await AdminActionLogCrud.create(
            db,
            admin_user_id=admin_user_id,
            action=action,
            target_type=target_type,
            target_id=target_id,
            before_value=before_value,
            after_value=after_value,
            reason=reason,
        )

    @staticmethod
    async def get_all_for_admin(
        db: AsyncSession,
        *,
        action: str | None = None,
        target_type: str | None = None,
        admin_user_id: int | None = None,
        start_at=None,
        end_at=None,
        limit: int = 100,
    ) -> list[AdminActionLog]:
        return await AdminActionLogCrud.get_all_for_admin(
            db,
            action=action,
            target_type=target_type,
            admin_user_id=admin_user_id,
            start_at=start_at,
            end_at=end_at,
            limit=limit,
        )
