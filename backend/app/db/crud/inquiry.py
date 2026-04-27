from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import desc, select

from app.db.models import Inquiry
from app.db.schemas.inquiries import InquiryStatus
from app.db.schemas.inquiries import InquiryCreate


class InquiryCrud:
    @staticmethod
    async def create(db: AsyncSession, inquiry_data: InquiryCreate) -> Inquiry:
        inquiry = Inquiry(**inquiry_data.model_dump(), status="pending")
        db.add(inquiry)
        await db.flush()
        return inquiry

    @staticmethod
    async def get_all(db: AsyncSession) -> list[Inquiry]:
        result = await db.execute(select(Inquiry).order_by(desc(Inquiry.created_at)))
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
