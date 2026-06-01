"""
backend/app/config.py

Central settings object for the application.
All other modules import `settings` from here.
Uses pydantic-settings so values are auto-read from the .env file.
No secrets are hardcoded — everything comes from environment variables.
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables / .env file.

    Fields:
        database_url          — Full PostgreSQL connection string.
        secret_key            — Application secret (reserved for future JWT use).
        backend_cors_origins  — Comma-separated list of allowed CORS origins.
    """

    database_url: str
    secret_key: str
    backend_cors_origins: str

    model_config = {
        # pydantic-settings v2 style: tell it which .env file to read
        "env_file": ".env",
        "env_file_encoding": "utf-8",
    }


# Module-level singleton — imported everywhere in the codebase.
settings = Settings()
