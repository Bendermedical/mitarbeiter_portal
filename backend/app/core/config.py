from typing import List, Union, Optional
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "BMV Mitarbeiterportal"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "bmv_super_secret_jwt_key_2026_change_in_production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours

    # Database
    DATABASE_URL: Optional[str] = None
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "bmv_admin"
    POSTGRES_PASSWORD: str = "bmv_secure_pass_2026"
    POSTGRES_DB: str = "mitarbeiter_portal"
    POSTGRES_PORT: int = 5432

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # Active Directory / OIDC Mocking
    AD_MOCK_ENABLED: bool = True
    AD_TENANT_ID: str = "bmv-tenant-id-001"
    AD_CLIENT_ID: str = "bmv-client-id-001"

    model_config = SettingsConfigDict(
        case_sensitive=True,
        env_file=".env",
        extra="allow",
    )

    @property
    def sync_database_url(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

settings = Settings()
