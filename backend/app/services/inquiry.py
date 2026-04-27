from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.crud import InquiryCrud
from app.db.models import Inquiry
from app.db.schemas.inquiries import InquiryCreate, InquiryStatusUpdate


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

    @staticmethod
    async def get_all_for_admin(db: AsyncSession) -> list[Inquiry]:
        return await InquiryCrud.get_all(db)

    @staticmethod
    async def get_by_id_for_admin(db: AsyncSession, inquiry_id: int) -> Inquiry:
        inquiry = await InquiryCrud.get_by_id(db, inquiry_id)
        if not inquiry:
            raise HTTPException(status_code=404, detail="Inquiry not found")
        return inquiry

    @staticmethod
    async def update_status_for_admin(
        db: AsyncSession,
        inquiry_id: int,
        update: InquiryStatusUpdate,
    ) -> Inquiry:
        inquiry = await InquiryService.get_by_id_for_admin(db, inquiry_id)
        try:
            updated = await InquiryCrud.update_status(db, inquiry, update.status)
            await db.commit()
            await db.refresh(updated)
            return updated
        except Exception:
            await db.rollback()
            raise
