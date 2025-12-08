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
    build_authorization_url,
    ensure_user_from_google,
    exchange_code_for_tokens,
    fetch_user_info,
)

router = APIRouter(prefix="/auth/google", tags=["OAuth"])


@router.get("/login")
async def google_login():
    state = secrets.token_urlsafe(32)
    redirect_url = build_authorization_url(state)
    response = RedirectResponse(url=redirect_url, status_code=302)
    response.set_cookie(
        key="oauth_state",
        value=state,
        httponly=True,
        secure=False,
        samesite="Lax",
        max_age=600,
    )
    return response


@router.get("/callback")
async def google_callback(
    request: Request,
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    frontend_redirect = settings.frontend_url.rstrip("/") or "http://localhost:3000"
    default_redirect = RedirectResponse(url=frontend_redirect, status_code=302)

    if error:
        return RedirectResponse(
            url=f"{frontend_redirect}/?auth_error={error}", status_code=302
        )

    saved_state = request.cookies.get("oauth_state")
    if saved_state and state != saved_state:
        return RedirectResponse(
            url=f"{frontend_redirect}/?auth_error=invalid_state", status_code=302
        )

    if not code:
        return RedirectResponse(
            url=f"{frontend_redirect}/?auth_error=missing_code", status_code=302
        )

    try:
        token_payload = await exchange_code_for_tokens(code)
        access_token = token_payload.get("access_token")
        if not access_token:
            raise GoogleOAuthError(status_code=400, detail="No access token")

        profile = await fetch_user_info(access_token)
        email = profile.get("email")
        name = profile.get("name") or profile.get("given_name")

        if not email:
            raise GoogleOAuthError(status_code=400, detail="Email not provided by Google")

        user = await ensure_user_from_google(db, email=email, name=name)

        refresh_token = create_refresh_token(user.user_id)
        access = create_access_token(user.user_id)

        try:
            await UserCrud.update_refresh_token_by_id(db, user.user_id, refresh_token)
            await db.commit()
            await db.refresh(user)
        except Exception:
            await db.rollback()
            raise GoogleOAuthError(status_code=500, detail="Failed to update session")

        response = RedirectResponse(url=frontend_redirect, status_code=302)
        response.delete_cookie(key="oauth_state")
        set_auth_cookies(response, access, refresh_token)
        return response

    except GoogleOAuthError as exc:
        return RedirectResponse(
            url=f"{frontend_redirect}/?auth_error={exc.detail}", status_code=302
        )
    except Exception:
        return default_redirect
