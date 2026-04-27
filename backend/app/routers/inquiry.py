from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_user_id
from app.db.database import get_db
from app.db.schemas.inquiries import InquiryCreate, InquiryRead
from app.services import InquiryService

router = APIRouter(prefix="/inquiries", tags=["Inquiry"])


@router.post("", response_model=InquiryRead, status_code=201)
async def create_inquiry(
    inquiry_data: InquiryCreate,
    user_id: int = Depends(get_user_id),
    db: AsyncSession = Depends(get_db),
):
    return await InquiryService.create(db, inquiry_data, user_id)
