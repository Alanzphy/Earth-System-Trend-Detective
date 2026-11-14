from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "Earth System Trend Detective API"
    app_version: str = "0.1.0"
    environment: str = "development"
    cors_origins: list[str] = Field(default_factory=lambda: ["http://localhost:5173"])
    cache_ttl_seconds: int = 900
    request_timeout_seconds: float = 30.0
    data_adapter: str = "fixture"


@lru_cache
def get_settings() -> Settings:
    return Settings()
