from sqlalchemy.ext.asyncio import AsyncSession

from app.db.crud import InquiryCrud
from app.db.models import Inquiry
from app.db.schemas.inquiries import InquiryCreate


class InquiryService:
    @staticmethod
    async def create(db: AsyncSession, inquiry_data: InquiryCreate) -> Inquiry:
        try:
            inquiry = await InquiryCrud.create(db, inquiry_data)
            await db.commit()
            await db.refresh(inquiry)
            return inquiry
        except Exception:
            await db.rollback()
            raise
