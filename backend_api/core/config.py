from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # App Config
    ENVIRONMENT: str = "production"
    SECRET_KEY: str = "changeme-in-production-long-secure-string"
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:5174,https://thermes.com.br,https://www.thermes.com.br"
    
    # Database (Defaults to SQLite for local dev, override with PostgreSQL URL on Railway)
    DATABASE_URL: str = "sqlite:///./engineering_platform.db"

    # Stripe
    STRIPE_SECRET_KEY: str = "sk_test_mock"

    # Sentry Storage
    SENTRY_DSN: str | None = None

    # Cloudflare R2 for PDFs
    R2_ACCOUNT_ID: str | None = None
    R2_ACCESS_KEY_ID: str | None = None
    R2_SECRET_ACCESS_KEY: str | None = None
    R2_BUCKET_NAME: str = "thermes-pdfs"

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
