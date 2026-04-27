from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import Inquiry
from app.db.schemas.inquiries import InquiryCreate


class InquiryCrud:
    @staticmethod
    async def create(db: AsyncSession, inquiry_data: InquiryCreate) -> Inquiry:
        inquiry = Inquiry(**inquiry_data.model_dump(), status="pending")
        db.add(inquiry)
        await db.flush()
        return inquiry
