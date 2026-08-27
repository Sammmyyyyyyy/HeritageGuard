import time
import logging

from starlette.middleware.base import (
    BaseHTTPMiddleware,
)


logger = logging.getLogger(
    "heritageguard.requests"
)


class LoggingMiddleware(BaseHTTPMiddleware):

    async def dispatch(
        self,
        request,
        call_next,
    ):
        start = time.perf_counter()

        response = await call_next(request)

        duration = (
            time.perf_counter() - start
        )

        logger.info(
            "%s %s -> %s (%.3fs)",
            request.method,
            request.url.path,
            response.status_code,
            duration,
        )

        return response