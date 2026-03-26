import time

from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, max_requests: int = 60, window_seconds: int = 60):
        super().__init__(app)
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.clients = {}

    async def dispatch(self, request: Request, call_next):
        # We use simple in-memory dict by IP for mock.
        # In prod, use Redis + user_id from token.
        client_ip = request.client.host if request.client else "unknown"
        current_time = time.time()

        if client_ip not in self.clients:
            self.clients[client_ip] = []

        # Filter requests within the window
        self.clients[client_ip] = [
            req_time
            for req_time in self.clients[client_ip]
            if current_time - req_time < self.window_seconds
        ]

        if len(self.clients[client_ip]) >= self.max_requests:
            return JSONResponse(
                status_code=429,
                content={"detail": "Too Many Requests", "retry_after": self.window_seconds},
                headers={"Retry-After": str(self.window_seconds)},
            )

        self.clients[client_ip].append(current_time)
        response = await call_next(request)
        return response
