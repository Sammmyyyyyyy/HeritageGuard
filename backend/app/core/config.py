from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):

    # =========================================================
    # APP
    # =========================================================

    APP_NAME: str = "HeritageGuard API"
    DEBUG: bool = True

    # =========================================================
    # SUPABASE
    # =========================================================

    SUPABASE_URL: str
    SUPABASE_KEY: str
    SUPABASE_STORAGE_BUCKET: str = "damage_image"

    # =========================================================
    # DAMAGE AI
    # =========================================================

    DAMAGE_AI_URL: str = "http://127.0.0.1:8002"
    DAMAGE_AI_ENDPOINT: str = "/analyze"

    # =========================================================
    # RECOMMENDATION AI
    # =========================================================

    RECOMMENDATION_AI_URL: str = "http://127.0.0.1:8001"
    RECOMMENDATION_AI_ENDPOINT: str = "/api/recommend"

    # =========================================================
    # RAG AI
    # =========================================================

    RAG_AI_URL: str = "http://127.0.0.1:8001"
    RAG_AI_ENDPOINT: str = "/api/rag/query"

    # =========================================================
    # CROWD AND PRESSURE AI
    # =========================================================

    CROWD_AI_URL: str = "http://127.0.0.1:8003"
    PRESSURE_AI_URL: str = "http://127.0.0.1:8003"

    # =========================================================
    # AI SETTINGS
    # =========================================================

    AI_TIMEOUT: float = 60.0
    MAX_UPLOAD_SIZE: int = 10485760

    # =========================================================
    # FRONTEND
    # =========================================================

    FRONTEND_URL: str = "https://heritage-guard-helper-smoky.vercel.app"

    # =========================================================
    # ENV FILE
    # =========================================================

    model_config = SettingsConfigDict(
        env_file=(".env", "backend/.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()