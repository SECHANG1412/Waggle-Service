import secrets

from fastapi import APIRouter, Depends, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import set_auth_cookies
from app.core.jwt_handler import create_access_token, create_refresh_token
from app.core.settings import settings
from app.db.crud import UserCrud
from app.db.database import get_db
from app.services.google_oauth import (
    GoogleOAuthError,
    build_authorization_url as build_google_authorization_url,
    ensure_user_from_google,
    exchange_code_for_tokens as exchange_google_code_for_tokens,
    fetch_user_info as fetch_google_user_info,
)
from app.services.kakao_oauth import (
    KakaoOAuthError,
    build_authorization_url as build_kakao_authorization_url,
    ensure_user_from_kakao,
    exchange_code_for_tokens as exchange_kakao_code_for_tokens,
    fetch_user_info as fetch_kakao_user_info,
)
from app.services.naver_oauth import (
    NaverOAuthError,
    build_authorization_url as build_naver_authorization_url,
    ensure_user_from_naver,
    exchange_code_for_tokens as exchange_naver_code_for_tokens,
    fetch_user_info as fetch_naver_user_info,
)

router = APIRouter(prefix="/auth", tags=["OAuth"])
STATE_COOKIE = "oauth_state"


def _set_state_cookie(response: RedirectResponse, state: str) -> None:
    response.set_cookie(
        key=STATE_COOKIE,
        value=state,
        httponly=True,
        secure=False,
        samesite="Lax",
        max_age=600,
    )


def _frontend_redirect_url() -> str:
    return settings.frontend_url.rstrip("/") or "http://localhost:3000"


def _redirect_with_error(error: str) -> RedirectResponse:
    frontend_redirect = _frontend_redirect_url()
    return RedirectResponse(url=f"{frontend_redirect}/?auth_error={error}", status_code=302)


def _validate_state(request: Request, state: str | None) -> RedirectResponse | None:
    saved_state = request.cookies.get(STATE_COOKIE)
    if saved_state and state != saved_state:
        return _redirect_with_error("invalid_state")
    if not state:
        return _redirect_with_error("missing_state")
    return None


async def _finalize_login(db: AsyncSession, user_id: int) -> RedirectResponse:
    frontend_redirect = _frontend_redirect_url()
    refresh_token = create_refresh_token(user_id)
    access = create_access_token(user_id)

    try:
        await UserCrud.update_refresh_token_by_id(db, user_id, refresh_token)
        await db.commit()
    except Exception:
        await db.rollback()
        raise

    response = RedirectResponse(url=frontend_redirect, status_code=302)
    response.delete_cookie(key=STATE_COOKIE)
    set_auth_cookies(response, access, refresh_token)
    return response


@router.get("/google/login")
async def google_login():
    state = secrets.token_urlsafe(32)
    redirect_url = build_google_authorization_url(state)
    response = RedirectResponse(url=redirect_url, status_code=302)
    _set_state_cookie(response, state)
    return response


@router.get("/google/callback")
async def google_callback(
    request: Request,
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    frontend_redirect = _frontend_redirect_url()
    default_redirect = RedirectResponse(url=frontend_redirect, status_code=302)

    if error:
        return _redirect_with_error(error)

    state_error = _validate_state(request, state)
    if state_error:
        return state_error

    if not code:
        return _redirect_with_error("missing_code")

    try:
        token_payload = await exchange_google_code_for_tokens(code)
        access_token = token_payload.get("access_token")
        if not access_token:
            raise GoogleOAuthError(status_code=400, detail="no_access_token")

        profile = await fetch_google_user_info(access_token)
        email = profile.get("email")
        name = profile.get("name") or profile.get("given_name")

        if not email:
            raise GoogleOAuthError(status_code=400, detail="email_not_provided")

        user = await ensure_user_from_google(db, email=email, name=name)
        return await _finalize_login(db, user.user_id)

    except GoogleOAuthError as exc:
        return _redirect_with_error(exc.detail or "google_oauth_error")
    except Exception:
        return default_redirect


@router.get("/naver/login")
async def naver_login():
    state = secrets.token_urlsafe(32)
    redirect_url = build_naver_authorization_url(state)
    response = RedirectResponse(url=redirect_url, status_code=302)
    _set_state_cookie(response, state)
    return response


@router.get("/naver/callback")
async def naver_callback(
    request: Request,
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    frontend_redirect = _frontend_redirect_url()
    default_redirect = RedirectResponse(url=frontend_redirect, status_code=302)

    if error:
        return _redirect_with_error(error)

    state_error = _validate_state(request, state)
    if state_error:
        return state_error

    if not code:
        return _redirect_with_error("missing_code")

    try:
        token_payload = await exchange_naver_code_for_tokens(code, state)
        access_token = token_payload.get("access_token")
        if not access_token:
            raise NaverOAuthError(status_code=400, detail="no_access_token")

        profile = await fetch_naver_user_info(access_token)
        email = profile.get("email")
        nickname = profile.get("nickname") or profile.get("name")

        user = await ensure_user_from_naver(db, email=email, nickname=nickname)
        return await _finalize_login(db, user.user_id)

    except NaverOAuthError as exc:
        return _redirect_with_error(exc.detail or "naver_oauth_error")
    except Exception:
        return default_redirect


@router.get("/kakao/login")
async def kakao_login():
    state = secrets.token_urlsafe(32)
    redirect_url = build_kakao_authorization_url(state)
    response = RedirectResponse(url=redirect_url, status_code=302)
    _set_state_cookie(response, state)
    return response


@router.get("/kakao/callback")
async def kakao_callback(
    request: Request,
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    frontend_redirect = _frontend_redirect_url()
    default_redirect = RedirectResponse(url=frontend_redirect, status_code=302)

    if error:
        return _redirect_with_error(error)

    state_error = _validate_state(request, state)
    if state_error:
        return state_error

    if not code:
        return _redirect_with_error("missing_code")

    try:
        token_payload = await exchange_kakao_code_for_tokens(code)
        access_token = token_payload.get("access_token")
        if not access_token:
            raise KakaoOAuthError(status_code=400, detail="no_access_token")

        profile = await fetch_kakao_user_info(access_token)
        provider_id = profile.get("id") if isinstance(profile, dict) else None
        account = profile.get("kakao_account", {}) if isinstance(profile, dict) else {}
        profile_data = account.get("profile", {}) if isinstance(account, dict) else {}

        email = account.get("email")
        nickname = profile_data.get("nickname")

        user = await ensure_user_from_kakao(
            db, provider_id=provider_id, email=email, nickname=nickname
        )
        return await _finalize_login(db, user.user_id)

    except KakaoOAuthError as exc:
        return _redirect_with_error(exc.detail or "kakao_oauth_error")
    except Exception:
        return default_redirect
