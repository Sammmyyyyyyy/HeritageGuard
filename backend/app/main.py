import os
import sys
from pathlib import Path

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings

from app.routers import (
    sites,
    damage,
    alerts,
    reports,
    recommendations,
    itineraries,
    pressure,
    crowd,
    rag,
)

from app.exceptions.base import AppException
from app.exceptions.handlers import (
    app_exception_handler,
    unexpected_exception_handler,
)

# =========================================================
# APPLICATION INSTANCE (Only 1 instance)
# =========================================================
app = FastAPI(
    title=getattr(settings, "APP_NAME", "HeritageGuard API"),
    debug=getattr(settings, "DEBUG", True),
)

# =========================================================
# EXCEPTION HANDLERS
# =========================================================
app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(Exception, unexpected_exception_handler)

# =========================================================
# CORS MIDDLEWARE
# =========================================================
raw_origins = getattr(settings, "CORS_ORIGINS", "")
cors_origins = [o.strip() for o in raw_origins.split(",") if o.strip()]
if settings.FRONTEND_URL and settings.FRONTEND_URL not in cors_origins:
    cors_origins.append(settings.FRONTEND_URL)

for default_origin in [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]:
    if default_origin not in cors_origins:
        cors_origins.append(default_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=r"https:\/\/.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================================================
# ROUTERS (Include each router ONCE)
# =========================================================
app.include_router(sites.router)
app.include_router(damage.router)
app.include_router(alerts.router)
app.include_router(reports.router)
app.include_router(recommendations.router)
app.include_router(itineraries.router)
app.include_router(pressure.router)
app.include_router(crowd.router)
app.include_router(rag.router)

# =========================================================
# ROOT & HEALTH CHECK
# =========================================================
@app.get("/")
def root():
    return {
        "message": "HeritageGuard API is running",
        "status": "success",
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "HeritageGuard Backend",
    }