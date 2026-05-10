import secrets

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.jwt_handler import get_password_hash
from app.db.crud import UserCrud
from app.db.models import User
from app.db.schemas.users import UserCreate


async def ensure_oauth_user(
    db: AsyncSession,
    *,
    email: str,
    username_source: str | None,
    fallback_username: str,
    create_error: type[HTTPException],
    create_error_detail: str,
) -> User:
    existing = await UserCrud.get_by_email(db, email)
    if existing:
        return existing

    base_username = (username_source or email.split("@")[0]).strip() or fallback_username
    base_username = base_username[:20]
    candidate = base_username
    suffix = 1

    while await UserCrud.get_by_normalized_username(db, candidate):
        candidate = f"{base_username}{suffix}"
        suffix += 1

    random_password = secrets.token_urlsafe(16)
    hashed_password = await get_password_hash(random_password)
    user_create = UserCreate(email=email, username=candidate, password=hashed_password)

    try:
        db_user = await UserCrud.create(db, user_create)
        await db.commit()
        await db.refresh(db_user)
        return db_user
    except Exception:
        await db.rollback()
        raise create_error(status_code=500, detail=create_error_detail)
