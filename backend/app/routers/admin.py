from fastapi import APIRouter, Depends

from app.core.auth import require_admin_user_id

router = APIRouter(prefix="/admin-api", tags=["Admin"])


@router.get("/me")
async def get_admin_me(admin_user_id: int = Depends(require_admin_user_id)):
    return {"user_id": admin_user_id, "is_admin": True}
