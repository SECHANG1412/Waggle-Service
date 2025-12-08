import secrets
from typing import Any, Dict
from urllib.parse import urlencode

import httpx
from fastapi import HTTPException

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.settings import settings
from app.core.jwt_handler import get_password_hash
from app.db.crud import UserCrud
from app.db.schemas.users import UserCreate


GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"


class GoogleOAuthError(HTTPException):
    pass


def build_authorization_url(state: str) -> str:
    if not settings.google_client_id or not settings.google_redirect_uri:
        raise GoogleOAuthError(status_code=500, detail="Google OAuth is not configured")

    params = {
        "client_id": settings.google_client_id,
        "redirect_uri": settings.google_redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "state": state,
        "prompt": "consent",
    }
    return f"{GOOGLE_AUTH_URL}?{urlencode(params)}"


async def exchange_code_for_tokens(code: str) -> Dict[str, Any]:
    if (
        not settings.google_client_id
        or not settings.google_client_secret
        or not settings.google_redirect_uri
    ):
        raise GoogleOAuthError(status_code=500, detail="Google OAuth is not configured")

    data = {
        "code": code,
        "client_id": settings.google_client_id,
        "client_secret": settings.google_client_secret,
        "redirect_uri": settings.google_redirect_uri,
        "grant_type": "authorization_code",
    }

    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.post(
            GOOGLE_TOKEN_URL,
            data=data,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )

    if response.status_code != 200:
        raise GoogleOAuthError(status_code=400, detail="Failed to exchange code")

    return response.json()


async def fetch_user_info(access_token: str) -> Dict[str, Any]:
    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.get(
            GOOGLE_USERINFO_URL, headers={"Authorization": f"Bearer {access_token}"}
        )

    if response.status_code != 200:
        raise GoogleOAuthError(status_code=400, detail="Failed to fetch Google profile")

    return response.json()


async def ensure_user_from_google(db: AsyncSession, email: str, name: str | None) -> Any:
    existing = await UserCrud.get_by_email(db, email)
    if existing:
        return existing

    base_username = (name or email.split("@")[0]).strip() or "google_user"
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
        raise GoogleOAuthError(status_code=500, detail="Failed to create Google user")
