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


KAKAO_AUTH_URL = "https://kauth.kakao.com/oauth/authorize"
KAKAO_TOKEN_URL = "https://kauth.kakao.com/oauth/token"
KAKAO_PROFILE_URL = "https://kapi.kakao.com/v2/user/me"


class KakaoOAuthError(HTTPException):
    pass


def build_authorization_url(state: str) -> str:
    if not settings.kakao_client_id or not settings.kakao_redirect_uri:
        raise KakaoOAuthError(status_code=500, detail="Kakao OAuth is not configured")

    params = {
        "client_id": settings.kakao_client_id,
        "redirect_uri": settings.kakao_redirect_uri,
        "response_type": "code",
        "state": state,
        # Email 스코프는 계정 설정에 따라 거부될 수 있으므로 필수로 요청하지 않는다.
        "scope": "profile_nickname profile_image",
        "prompt": "login",
    }
    return f"{KAKAO_AUTH_URL}?{urlencode(params)}"


async def exchange_code_for_tokens(code: str) -> Dict[str, Any]:
    if not settings.kakao_client_id or not settings.kakao_redirect_uri:
        raise KakaoOAuthError(status_code=500, detail="Kakao OAuth is not configured")

    data = {
        "grant_type": "authorization_code",
        "client_id": settings.kakao_client_id,
        "redirect_uri": settings.kakao_redirect_uri,
        "code": code,
    }

    if settings.kakao_client_secret:
        data["client_secret"] = settings.kakao_client_secret

    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.post(
            KAKAO_TOKEN_URL,
            data=data,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )

    if response.status_code != 200:
        raise KakaoOAuthError(status_code=400, detail="Failed to exchange code")

    return response.json()


async def fetch_user_info(access_token: str) -> Dict[str, Any]:
    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.get(
            KAKAO_PROFILE_URL, headers={"Authorization": f"Bearer {access_token}"}
        )

    if response.status_code != 200:
        raise KakaoOAuthError(status_code=400, detail="Failed to fetch Kakao profile")

    return response.json()


async def ensure_user_from_kakao(
    db: AsyncSession, provider_id: Any, email: str | None, nickname: str | None
) -> Any:
    if provider_id is None:
        raise KakaoOAuthError(status_code=400, detail="provider_id_required")

    # 이메일이 없으면 공급자 ID 기반의 placeholder 이메일을 생성한다.
    effective_email = email or f"kakao_{provider_id}@placeholder.local"

    existing = await UserCrud.get_by_email(db, effective_email)
    if existing:
        return existing

    base_username = (nickname or str(provider_id)).strip() or "kakao_user"
    base_username = base_username[:20]
    candidate = base_username
    suffix = 1

    while await UserCrud.get_by_username(db, candidate):
        candidate = f"{base_username}{suffix}"
        suffix += 1

    random_password = secrets.token_urlsafe(16)
    hashed_password = await get_password_hash(random_password)

    user_create = UserCreate(
        email=effective_email, username=candidate, password=hashed_password
    )

    try:
        db_user = await UserCrud.create(db, user_create)
        await db.commit()
        await db.refresh(db_user)
        return db_user
    except Exception:
        await db.rollback()
        raise KakaoOAuthError(status_code=500, detail="Failed to create Kakao user")
