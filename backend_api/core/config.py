from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # App Config
    ENVIRONMENT: str = "production"
    SECRET_KEY: str = "changeme-in-production-long-secure-string"

    # CORS
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:5174,https://thermes.com.br,https://www.thermes.com.br,https://app.thermes.com.br,https://thorough-serenity-production.up.railway.app"

    # Database (Defaults to SQLite for local dev, override with PostgreSQL URL on Railway)
    DATABASE_URL: str = "sqlite:///./engineering_platform.db"

    # Stripe
    STRIPE_SECRET_KEY: str = "sk_test_mock"
    STRIPE_WEBHOOK_SECRET: str = "whsec_mock"
    STRIPE_PRICE_PRO: str = "price_pro_mock_id"
    STRIPE_PRICE_ENTERPRISE: str = "price_enterprise_mock_id"

    # Sentry
    SENTRY_DSN: str | None = None

    # Cloudflare R2 for PDFs
    R2_ACCOUNT_ID: str | None = None
    R2_ACCESS_KEY_ID: str | None = None
    R2_SECRET_ACCESS_KEY: str | None = None
    R2_BUCKET_NAME: str = "thermes-pdfs"

    # Ignore any extra env vars injected by Railway or the OS
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
