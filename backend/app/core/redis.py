from __future__ import annotations

import inspect
import logging
from typing import Any

from app.core.settings import settings

logger = logging.getLogger(__name__)


async def create_redis_client() -> Any | None:
    if not settings.rate_limit_enabled:
        return None

    try:
        from redis.asyncio import Redis
    except ImportError:
        logger.warning("redis package is not installed; rate limiting is disabled")
        return None

    try:
        client = Redis.from_url(settings.redis_url, encoding="utf-8", decode_responses=True)
        await client.ping()
    except Exception:
        logger.exception("failed to connect to redis; rate limiting is disabled")
        return None

    return client


async def close_redis_client(client: Any | None) -> None:
    if client is None:
        return

    close = getattr(client, "aclose", None) or getattr(client, "close", None)
    if close is None:
        return

    result = close()
    if inspect.isawaitable(result):
        await result