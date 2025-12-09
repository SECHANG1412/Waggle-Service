import secrets
from typing import Any, Dict
from urllib.parse import urlencode

import httpx
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.jwt_handler import get_password_hash
from app.core.settings import settings
from app.db.crud import UserCrud
from app.db.schemas.users import UserCreate


NAVER_AUTH_URL = "https://nid.naver.com/oauth2.0/authorize"
NAVER_TOKEN_URL = "https://nid.naver.com/oauth2.0/token"
NAVER_PROFILE_URL = "https://openapi.naver.com/v1/nid/me"


class NaverOAuthError(HTTPException):
    pass


def build_authorization_url(state: str) -> str:
    if not settings.naver_client_id or not settings.naver_redirect_uri:
        raise NaverOAuthError(status_code=500, detail="Naver OAuth is not configured")

    params = {
        "client_id": settings.naver_client_id,
        "redirect_uri": settings.naver_redirect_uri,
        "response_type": "code",
        "state": state,
        "scope": "name email nickname profile_image",
    }
    return f"{NAVER_AUTH_URL}?{urlencode(params)}"


async def exchange_code_for_tokens(code: str, state: str) -> Dict[str, Any]:
    if (
        not settings.naver_client_id
        or not settings.naver_client_secret
        or not settings.naver_redirect_uri
    ):
        raise NaverOAuthError(status_code=500, detail="Naver OAuth is not configured")

    data = {
        "grant_type": "authorization_code",
        "client_id": settings.naver_client_id,
        "client_secret": settings.naver_client_secret,
        "code": code,
        "state": state,
    }

    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.post(
            NAVER_TOKEN_URL,
            data=data,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )

    if response.status_code != 200:
        raise NaverOAuthError(status_code=400, detail="Failed to exchange code")

    return response.json()


async def fetch_user_info(access_token: str) -> Dict[str, Any]:
    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.get(
            NAVER_PROFILE_URL, headers={"Authorization": f"Bearer {access_token}"}
        )

    if response.status_code != 200:
        raise NaverOAuthError(status_code=400, detail="Failed to fetch Naver profile")

    data = response.json()
    if data.get("resultcode") != "00":
        raise NaverOAuthError(status_code=400, detail="Failed to fetch Naver profile")

    return data.get("response", {})


async def ensure_user_from_naver(
    db: AsyncSession, email: str | None, nickname: str | None
) -> Any:
    if not email:
        raise NaverOAuthError(status_code=400, detail="email_required")

    existing = await UserCrud.get_by_email(db, email)
    if existing:
        return existing

    base_username = (nickname or email.split("@")[0]).strip() or "naver_user"
    base_username = base_username[:20]
    candidate = base_username
    suffix = 1

    while await UserCrud.get_by_username(db, candidate):
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
        raise NaverOAuthError(status_code=500, detail="Failed to create Naver user")
