from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import require_admin_user_id
from app.db.database import get_db
from app.db.schemas.inquiries import InquiryRead, InquiryStatusUpdate
from app.services import InquiryService

router = APIRouter(prefix="/admin-api", tags=["Admin"])


@router.get("/me")
async def get_admin_me(admin_user_id: int = Depends(require_admin_user_id)):
    return {"user_id": admin_user_id, "is_admin": True}


@router.get("/inquiries", response_model=list[InquiryRead])
async def list_inquiries(
    _admin_user_id: int = Depends(require_admin_user_id),
    db: AsyncSession = Depends(get_db),
):
    return await InquiryService.get_all_for_admin(db)


@router.get("/inquiries/{inquiry_id}", response_model=InquiryRead)
async def get_inquiry(
    inquiry_id: int,
    _admin_user_id: int = Depends(require_admin_user_id),
    db: AsyncSession = Depends(get_db),
):
    return await InquiryService.get_by_id_for_admin(db, inquiry_id)


@router.patch("/inquiries/{inquiry_id}/status", response_model=InquiryRead)
async def update_inquiry_status(
    inquiry_id: int,
    update: InquiryStatusUpdate,
    admin_user_id: int = Depends(require_admin_user_id),
    db: AsyncSession = Depends(get_db),
):
    return await InquiryService.update_status_for_admin(
        db, inquiry_id, update, admin_user_id
    )
