from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = "League POE API"
    app_env: str = Field(default="development", alias="APP_ENV")
    debug: bool = False
    storage_backend: str = "memory"

    jwt_secret: str = Field(default="change-me", alias="JWT_SECRET")
    jwt_algorithm: str = "HS256"
    access_token_ttl_minutes: int = 60 * 24 * 7
    auth_cookie_name: str = "league_poe_access_token"
    auth_cookie_secure: bool = False

    cors_origins: str = Field(
        default="http://localhost:5173,http://127.0.0.1:5173",
        alias="CORS_ORIGINS",
    )

    ydb_endpoint: str | None = Field(default=None, alias="YDB_ENDPOINT")
    ydb_database: str | None = Field(default=None, alias="YDB_DATABASE")

    def cors_origin_list(self) -> list[str]:
        if not self.cors_origins.strip():
            return []
        if self.cors_origins.strip() == "*":
            return ["*"]
        return [item.strip() for item in self.cors_origins.split(",") if item.strip()]


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
