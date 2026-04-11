import os

STRIPE_SECRET_KEY = os.environ.get("STRIPE_SECRET_KEY", "sk_test_mock")
STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "whsec_mock")

PRICE_IDS = {
    "pro": os.environ.get("STRIPE_PRICE_PRO", "price_pro_mock_id"),
    "enterprise": os.environ.get("STRIPE_PRICE_ENTERPRISE", "price_enterprise_mock_id"),
}
