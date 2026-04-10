from __future__ import annotations

import time

from starlette.middleware.base import BaseHTTPMiddleware

from app.metrics import http_request_duration_seconds, http_requests_total


class PrometheusMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        started_at = time.perf_counter()
        response = await call_next(request)

        duration = time.perf_counter() - started_at
        route_path = request.url.path
        method = request.method
        status = str(response.status_code)

        http_requests_total.labels(method=method, path=route_path, status=status).inc()
        http_request_duration_seconds.labels(method=method, path=route_path).observe(
            duration
        )

        return response
