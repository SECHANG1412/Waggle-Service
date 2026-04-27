from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import AdminActionLog


class AdminActionLogCrud:
    @staticmethod
    async def create(
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
        log = AdminActionLog(
            admin_user_id=admin_user_id,
            action=action,
            target_type=target_type,
            target_id=target_id,
            before_value=before_value,
            after_value=after_value,
            reason=reason,
        )
        db.add(log)
        await db.flush()
        return log
