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
