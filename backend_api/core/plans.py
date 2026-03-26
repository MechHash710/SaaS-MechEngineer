from typing import Any

PLANS_CONFIG: dict[str, dict[str, Any]] = {
    "free": {
        "max_simulations_per_month": 5,
        "allowed_pdfs": ["memorial"],
        "has_api_access": False,
        "priority_support": False,
        "price_brl": 0,
        "stripe_price_id": "",  # Should be filled if there is an actual Stripe price ID for free tier, or handled separately
    },
    "pro": {
        "max_simulations_per_month": -1,  # -1 means unlimited
        "allowed_pdfs": ["memorial", "laudo", "especificacao", "relatorio_completo"],
        "has_api_access": False,
        "priority_support": False,
        "price_brl": 97,
        "stripe_price_id": "price_pro_mock_id",  # Replace with actual Stripe price ID in production
    },
    "enterprise": {
        "max_simulations_per_month": -1,
        "allowed_pdfs": ["memorial", "laudo", "especificacao", "relatorio_completo"],
        "has_api_access": True,
        "priority_support": True,
        "price_brl": 297,
        "stripe_price_id": "price_enterprise_mock_id",  # Replace with actual Stripe price ID in production
    },
}


def get_plan_config(plan_name: str) -> dict[str, Any]:
    # Default to free if unknown plan
    return PLANS_CONFIG.get(plan_name.lower(), PLANS_CONFIG["free"])
