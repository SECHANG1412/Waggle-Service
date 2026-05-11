from datetime import datetime

from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import Inquiry, User
from app.db.schemas.inquiries import InquiryCreate, InquiryStatus


class InquiryCrud:
    @staticmethod
    async def create(
        db: AsyncSession,
        inquiry_data: InquiryCreate,
        user: User,
    ) -> Inquiry:
        inquiry = Inquiry(
            **inquiry_data.model_dump(),
            user_id=user.user_id,
            name=user.username,
            email=user.email,
            status="pending",
        )
        db.add(inquiry)
        await db.flush()
        return inquiry

    @staticmethod
    async def get_all(
        db: AsyncSession,
        *,
        status: str | None = None,
        start_at: datetime | None = None,
        end_at: datetime | None = None,
    ) -> list[Inquiry]:
        query = select(Inquiry)
        if status:
            query = query.where(Inquiry.status == status)
        else:
            query = query.where(Inquiry.status != "deleted")
        if start_at:
            query = query.where(Inquiry.created_at >= start_at)
        if end_at:
            query = query.where(Inquiry.created_at < end_at)
        query = query.order_by(desc(Inquiry.created_at), desc(Inquiry.inquiry_id))
        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def get_all_by_user_id(db: AsyncSession, user_id: int) -> list[Inquiry]:
        result = await db.execute(
            select(Inquiry)
            .where(Inquiry.user_id == user_id, Inquiry.status != "deleted")
            .order_by(desc(Inquiry.created_at), desc(Inquiry.inquiry_id))
        )
        return list(result.scalars().all())

    @staticmethod
    async def get_by_id(db: AsyncSession, inquiry_id: int) -> Inquiry | None:
        return await db.get(Inquiry, inquiry_id)

    @staticmethod
    async def update_status(
        db: AsyncSession,
        inquiry: Inquiry,
        status: InquiryStatus,
    ) -> Inquiry:
        inquiry.status = status
        await db.flush()
        return inquiry

    @staticmethod
    async def delete(db: AsyncSession, inquiry: Inquiry) -> None:
        await db.delete(inquiry)
        await db.flush()
