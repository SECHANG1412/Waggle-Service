from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import require_admin_user_id
from app.db.database import get_db
from app.db.schemas.admin_action_logs import AdminActionLogRead
from app.db.schemas.comments import CommentAdminRead, CommentModerationUpdate
from app.db.schemas.inquiries import InquiryDeleteUpdate, InquiryRead, InquiryStatusUpdate
from app.db.schemas.topics import TopicAdminRead, TopicModerationUpdate
from app.services import AdminActionLogService, CommentService, InquiryService, TopicService

router = APIRouter(prefix="/manage-api", tags=["Admin"])


@router.get("/me")
async def get_admin_me(admin_user_id: int = Depends(require_admin_user_id)):
    return {"user_id": admin_user_id, "is_admin": True}


@router.get("/logs", response_model=list[AdminActionLogRead])
async def list_admin_action_logs(
    _admin_user_id: int = Depends(require_admin_user_id),
    db: AsyncSession = Depends(get_db),
    action: str | None = None,
    target_type: str | None = None,
    admin_user_id: int | None = None,
    start_at: datetime | None = None,
    end_at: datetime | None = None,
    limit: int = Query(default=100, ge=1, le=200),
):
    return await AdminActionLogService.get_all_for_admin(
        db,
        action=action,
        target_type=target_type,
        admin_user_id=admin_user_id,
        start_at=start_at,
        end_at=end_at,
        limit=limit,
    )


@router.get("/inquiries", response_model=list[InquiryRead])
async def list_inquiries(
    _admin_user_id: int = Depends(require_admin_user_id),
    db: AsyncSession = Depends(get_db),
    status: str | None = None,
    start_at: datetime | None = None,
    end_at: datetime | None = None,
):
    return await InquiryService.get_all_for_admin(
        db,
        status=status,
        start_at=start_at,
        end_at=end_at,
    )


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


@router.patch("/inquiries/{inquiry_id}/delete")
async def delete_inquiry(
    inquiry_id: int,
    update: InquiryDeleteUpdate,
    admin_user_id: int = Depends(require_admin_user_id),
    db: AsyncSession = Depends(get_db),
):
    return await InquiryService.delete_for_admin(db, inquiry_id, update, admin_user_id)


@router.get("/topics", response_model=list[TopicAdminRead])
async def list_topics_for_admin(
    _admin_user_id: int = Depends(require_admin_user_id),
    db: AsyncSession = Depends(get_db),
    status: str | None = None,
    start_at: datetime | None = None,
    end_at: datetime | None = None,
):
    return await TopicService.get_all_for_admin(
        db,
        status=status,
        start_at=start_at,
        end_at=end_at,
    )


@router.patch("/topics/{topic_id}/delete")
async def delete_topic_for_admin(
    topic_id: int,
    update: TopicModerationUpdate,
    admin_user_id: int = Depends(require_admin_user_id),
    db: AsyncSession = Depends(get_db),
):
    return await TopicService.delete_for_admin(db, topic_id, update, admin_user_id)


@router.get("/comments", response_model=list[CommentAdminRead])
async def list_comments_for_admin(
    _admin_user_id: int = Depends(require_admin_user_id),
    db: AsyncSession = Depends(get_db),
    status: str | None = None,
    start_at: datetime | None = None,
    end_at: datetime | None = None,
):
    return await CommentService.get_all_for_admin(
        db,
        status=status,
        start_at=start_at,
        end_at=end_at,
    )


@router.patch("/comments/{comment_id}/delete")
async def delete_comment_for_admin(
    comment_id: int,
    update: CommentModerationUpdate,
    admin_user_id: int = Depends(require_admin_user_id),
    db: AsyncSession = Depends(get_db),
):
    return await CommentService.delete_for_admin(db, comment_id, update, admin_user_id)
