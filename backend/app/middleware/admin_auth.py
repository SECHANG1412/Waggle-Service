import base64
import secrets
from typing import Optional

from fastapi import Request
from fastapi.responses import PlainTextResponse
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint

from app.core.settings import settings


class AdminBasicAuthMiddleware(BaseHTTPMiddleware):
    """
    Protects /admin endpoints with HTTP Basic auth only in PROD mode.
    In non-PROD environments the middleware is a no-op.
    """

    def __init__(self, app, username: Optional[str], password: Optional[str]):
        super().__init__(app)
        self.username = username or ""
        self.password = password or ""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint):
        # Only enforce in PROD and for /admin paths
        if not settings.prod or not request.url.path.startswith("/admin"):
            return await call_next(request)

        # If credentials are not configured, block access to avoid accidental exposure
        if not self.username or not self.password:
            return PlainTextResponse(
                "Admin credentials not configured", status_code=500
            )

        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.lower().startswith("basic "):
            return self._unauthorized()

        try:
            encoded = auth_header.split(" ", 1)[1]
            decoded = base64.b64decode(encoded).decode("utf-8")
            provided_username, provided_password = decoded.split(":", 1)
        except Exception:
            return self._unauthorized()

        if not (
            secrets.compare_digest(provided_username, self.username)
            and secrets.compare_digest(provided_password, self.password)
        ):
            return self._unauthorized()

        return await call_next(request)

    def _unauthorized(self) -> PlainTextResponse:
        return PlainTextResponse(
            "Unauthorized",
            status_code=401,
            headers={"WWW-Authenticate": 'Basic realm="Admin"'},
        )
