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
    async def get_all(db: AsyncSession) -> list[Inquiry]:
        result = await db.execute(select(Inquiry).order_by(desc(Inquiry.created_at)))
        return list(result.scalars().all())

    @staticmethod
    async def get_all_by_user_id(db: AsyncSession, user_id: int) -> list[Inquiry]:
        result = await db.execute(
            select(Inquiry)
            .where(Inquiry.user_id == user_id)
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
