import os

from dotenv import load_dotenv

load_dotenv()

STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "sk_test_mock")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "whsec_mock")

PRICE_IDS = {
    "pro": os.getenv("STRIPE_PRICE_PRO", "price_pro_mock_id"),
    "enterprise": os.getenv("STRIPE_PRICE_ENTERPRISE", "price_enterprise_mock_id"),
}
