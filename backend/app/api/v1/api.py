from fastapi import APIRouter
from app.api.v1.endpoints import auth, hr, directory

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication & AD Sync"])
api_router.include_router(hr.router, prefix="/hr", tags=["HR & Culture Pillar"])
api_router.include_router(directory.router, prefix="/hr", tags=["Staff Directory"])
