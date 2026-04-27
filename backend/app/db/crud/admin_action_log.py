from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import desc, select

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

    @staticmethod
    async def get_all_for_admin(
        db: AsyncSession,
        *,
        action: str | None = None,
        target_type: str | None = None,
        admin_user_id: int | None = None,
        limit: int = 100,
    ) -> list[AdminActionLog]:
        query = select(AdminActionLog)

        if action:
            query = query.where(AdminActionLog.action == action)
        if target_type:
            query = query.where(AdminActionLog.target_type == target_type)
        if admin_user_id is not None:
            query = query.where(AdminActionLog.admin_user_id == admin_user_id)

        query = query.order_by(desc(AdminActionLog.created_at), desc(AdminActionLog.log_id)).limit(limit)
        result = await db.execute(query)
        return list(result.scalars().all())
