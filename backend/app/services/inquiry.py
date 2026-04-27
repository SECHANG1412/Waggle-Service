from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.crud import InquiryCrud, UserCrud
from app.db.models import Inquiry
from app.db.schemas.inquiries import InquiryCreate, InquiryStatusUpdate
from app.services.admin_action_log import AdminActionLogService


class InquiryService:
    @staticmethod
    async def create(
        db: AsyncSession,
        inquiry_data: InquiryCreate,
        user_id: int,
    ) -> Inquiry:
        user = await UserCrud.get_by_id(db, user_id)
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        try:
            inquiry = await InquiryCrud.create(db, inquiry_data, user)
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
        admin_user_id: int,
    ) -> Inquiry:
        inquiry = await InquiryService.get_by_id_for_admin(db, inquiry_id)
        before_status = inquiry.status
        try:
            updated = await InquiryCrud.update_status(db, inquiry, update.status)
            await AdminActionLogService.record(
                db,
                admin_user_id=admin_user_id,
                action="UPDATE_INQUIRY_STATUS",
                target_type="Inquiry",
                target_id=inquiry_id,
                before_value={"status": before_status},
                after_value={"status": update.status},
                reason=update.reason,
            )
            await db.commit()
            await db.refresh(updated)
            return updated
        except Exception:
            await db.rollback()
            raise
