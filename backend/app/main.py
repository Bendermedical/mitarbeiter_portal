from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.api import api_router
from app.db.session import engine, Base, SessionLocal
from app.services.ad_sync_service import ADSyncService

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure tables and seed data if DB reachable
    try:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        try:
            ADSyncService.ensure_default_ad_mappings(db)
            if settings.AD_MOCK_ENABLED:
                ADSyncService.seed_demo_directory(db)
        finally:
            db.close()
    except Exception as e:
        # In test environments or when DB is offline, continue
        pass
    yield
    # Shutdown

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="BMV Staff Portal — Master Product API (HR & Culture, IT Desk, Fleet, Assets)",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan,
)

# CORS Middleware
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix=settings.API_V1_STR)

from fastapi.responses import RedirectResponse

@app.get("/", include_in_schema=False)
def root_redirect():
    return RedirectResponse(url=f"{settings.API_V1_STR}/docs")

@app.get("/docs", include_in_schema=False)
def docs_redirect():
    return RedirectResponse(url=f"{settings.API_V1_STR}/docs")

@app.get("/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "service": "BMV Staff Portal Backend",
        "version": "1.0.0",
    }
