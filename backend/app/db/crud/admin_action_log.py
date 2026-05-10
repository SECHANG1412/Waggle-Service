from datetime import datetime

from sqlalchemy import desc, select
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

    @staticmethod
    async def get_all_for_admin(
        db: AsyncSession,
        *,
        action: str | None = None,
        target_type: str | None = None,
        admin_user_id: int | None = None,
        start_at: datetime | None = None,
        end_at: datetime | None = None,
        limit: int = 100,
    ) -> list[AdminActionLog]:
        query = select(AdminActionLog)

        if action:
            query = query.where(AdminActionLog.action == action)
        if target_type:
            query = query.where(AdminActionLog.target_type == target_type)
        if admin_user_id is not None:
            query = query.where(AdminActionLog.admin_user_id == admin_user_id)
        if start_at:
            query = query.where(AdminActionLog.created_at >= start_at)
        if end_at:
            query = query.where(AdminActionLog.created_at < end_at)

        query = query.order_by(desc(AdminActionLog.created_at), desc(AdminActionLog.log_id)).limit(limit)
        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def get_latest_reasons_by_targets(
        db: AsyncSession,
        *,
        action: str,
        target_type: str,
        target_ids: list[int],
    ) -> dict[int, str]:
        if not target_ids:
            return {}

        result = await db.execute(
            select(AdminActionLog)
            .where(
                AdminActionLog.action == action,
                AdminActionLog.target_type == target_type,
                AdminActionLog.target_id.in_(target_ids),
            )
            .order_by(desc(AdminActionLog.created_at), desc(AdminActionLog.log_id))
        )

        latest_reasons: dict[int, str] = {}
        for log in result.scalars().all():
            if log.target_id not in latest_reasons:
                latest_reasons[log.target_id] = log.reason
        return latest_reasons
