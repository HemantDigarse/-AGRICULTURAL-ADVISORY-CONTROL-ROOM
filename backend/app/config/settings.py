"""Application settings using Pydantic BaseSettings."""

from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    # --- Mode ---
    DEMO_MODE: bool = Field(default=True, description="Run in demo mode with mock data")

    # --- OpenAI ---
    OPENAI_API_KEY: str = Field(default="", description="OpenAI API key")
    OPENAI_MODEL: str = Field(default="gpt-4", description="OpenAI model name")

    # --- Weather API ---
    WEATHER_API_KEY: str = Field(default="", description="OpenWeatherMap API key")

    # --- Database ---
    DATABASE_URL: str = Field(
        default="sqlite+aiosqlite:///./agriculture_advisory.db",
        description="Async database connection URL",
    )

    # --- ChromaDB ---
    CHROMA_PERSIST_DIR: str = Field(default="./chroma_data", description="ChromaDB persistence directory")

    # --- App Metadata ---
    APP_NAME: str = Field(default="Agricultural Advisory Control Room", description="Application name")
    APP_VERSION: str = Field(default="1.0.0", description="Application version")

    # --- Server ---
    HOST: str = Field(default="0.0.0.0", description="Server host")
    PORT: int = Field(default=8000, description="Server port")
    LOG_LEVEL: str = Field(default="info", description="Logging level")

    # --- CORS ---
    CORS_ORIGINS: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:5173"],
        description="Allowed CORS origins",
    )

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


# Singleton settings instance
settings = Settings()
