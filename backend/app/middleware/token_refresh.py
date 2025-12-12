from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request
from jwt import ExpiredSignatureError, InvalidTokenError
from app.db.database import AsyncSessionLocal
from app.core.jwt_handler import verify_token, create_access_token, create_refresh_token
from app.db.crud import UserCrud
from app.core.auth import set_auth_cookies


class TokenRefreshMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        access_token = request.cookies.get("access_token")
        refresh_token = request.cookies.get("refresh_token")
        new_tokens: tuple[str, str] | None = None

        # 1) Access 토큰이 유효하면 그대로 진행
        user_id = None
        if access_token:
            try:
                user_id = verify_token(access_token)
            except (ExpiredSignatureError, InvalidTokenError):
                user_id = None

        # 2) Access 토큰이 없거나 만료/무효일 때만 refresh 시도
        if user_id is None and refresh_token:
            try:
                user_id = verify_token(refresh_token)
            except (ExpiredSignatureError, InvalidTokenError):
                response = await call_next(request)
                response.delete_cookie(key="access_token")
                response.delete_cookie(key="refresh_token")
                return response

            async with AsyncSessionLocal() as db:
                user = await UserCrud.get_by_id(db, user_id)
                if not user or user.refresh_token != refresh_token:
                    response = await call_next(request)
                    response.delete_cookie(key="access_token")
                    response.delete_cookie(key="refresh_token")
                    return response

                new_access_token = create_access_token(user_id)
                new_refresh_token = create_refresh_token(user_id)

                try:
                    await UserCrud.update_refresh_token_by_id(db, user_id, new_refresh_token)
                    await db.commit()
                except Exception:
                    await db.rollback()
                    raise

                # Downstream dependency에서 새 access 토큰을 쓰도록 요청 쿠키를 갱신
                request._cookies = dict(request.cookies)
                request._cookies["access_token"] = new_access_token
                new_tokens = (new_access_token, new_refresh_token)

        response = await call_next(request)

        if new_tokens:
            set_auth_cookies(response, new_tokens[0], new_tokens[1])

        return response
