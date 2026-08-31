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

    DAMAGE_AI_URL: str = "https://heritageguard-2.onrender.com"
    DAMAGE_AI_ENDPOINT: str = "/analyze"

    # =========================================================
    # RECOMMENDATION AI
    # =========================================================

    RECOMMENDATION_AI_URL: str = "https://heritageguard-rag-reco.onrender.com"
    RECOMMENDATION_AI_ENDPOINT: str = "/api/recommend"

    # =========================================================
    # RAG AI
    # =========================================================

    RAG_AI_URL: str = "https://heritageguard-rag-reco.onrender.com"
    RAG_AI_ENDPOINT: str = "/api/rag/query"

    # =========================================================
    # CROWD AND PRESSURE AI
    # =========================================================

    CROWD_AI_URL: str = "https://heritageguard-4.onrender.com"
    PRESSURE_AI_URL: str = "https://heritageguard-4.onrender.com"

    # =========================================================
    # AI SETTINGS
    # =========================================================

    AI_TIMEOUT: float = 60.0
    MAX_UPLOAD_SIZE: int = 10485760

    # =========================================================
    # FRONTEND & CORS
    # =========================================================

    FRONTEND_URL: str = "https://heritage-guard-one.vercel.app"
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000,https://heritage-guard-one.vercel.app,https://heritage-guard-helper-smoky.vercel.app"

    # =========================================================
    # ENV FILE
    # =========================================================

    model_config = SettingsConfigDict(
        env_file=(".env", "backend/.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()