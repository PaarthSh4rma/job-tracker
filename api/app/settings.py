import os
from dataclasses import dataclass
from functools import lru_cache

from dotenv import load_dotenv


DEFAULT_CORS_ORIGINS = (
    "http://localhost:5173",
    "http://127.0.0.1:5173",
)


@dataclass(frozen=True)
class Settings:
    database_url: str
    cors_origins: tuple[str, ...] = DEFAULT_CORS_ORIGINS

    @classmethod
    def from_environment(cls) -> "Settings":
        load_dotenv()

        database_url = os.getenv("DATABASE_URL", "").strip()
        if not database_url:
            raise RuntimeError("DATABASE_URL is required to start the API")

        raw_origins = os.getenv("CORS_ORIGINS", "")
        cors_origins = tuple(
            origin.strip() for origin in raw_origins.split(",") if origin.strip()
        )

        if "*" in cors_origins:
            raise RuntimeError(
                "CORS_ORIGINS cannot contain '*' when credentials are enabled"
            )

        return cls(
            database_url=database_url,
            cors_origins=cors_origins or DEFAULT_CORS_ORIGINS,
        )


@lru_cache
def get_settings() -> Settings:
    return Settings.from_environment()
