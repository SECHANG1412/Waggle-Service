from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.core.auth import get_user_id
from app.services import LikeService

router = APIRouter(prefix="/likes", tags=["Like"])


@router.put("/topic/{topic_id}", response_model=bool)
async def toggle_topic_like(
    topic_id: int,
    user_id: int = Depends(get_user_id),
    db: AsyncSession = Depends(get_db),
):
    return await LikeService.toggle_topic_like(db, user_id, topic_id)


@router.put("/comment/{comment_id}", response_model=bool)
async def toggle_comment_like(
    comment_id: int,
    user_id: int = Depends(get_user_id),
    db: AsyncSession = Depends(get_db),
):
    return await LikeService.toggle_comment_like(db, user_id, comment_id)


@router.put("/reply/{reply_id}", response_model=bool)
async def toggle_reply_like(
    reply_id: int,
    user_id: int = Depends(get_user_id),
    db: AsyncSession = Depends(get_db),
):
    return await LikeService.toggle_reply_like(db, user_id, reply_id)
