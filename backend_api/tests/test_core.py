from datetime import timedelta

from core.plans import get_plan_config
from core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    verify_password,
)
from core.stripe_config import PRICE_IDS, STRIPE_SECRET_KEY
from core.unit_converter import (
    btu_h_to_kw,
    btu_h_to_watts,
    celsius_to_fahrenheit,
    fahrenheit_to_celsius,
    ft2_to_m2,
    kcal_to_kwh,
    kw_to_btu_h,
    kw_to_watts,
    kwh_to_kcal,
    l_h_to_m3_h,
    m2_to_ft2,
    m3_h_to_l_h,
    watts_to_btu_h,
    watts_to_kw,
)


# --- unit_converter tests ---
def test_unit_converter():
    assert round(watts_to_btu_h(1000), 2) == 3412.14
    assert round(btu_h_to_watts(3412.14), 2) == 1000.00
    assert round(kcal_to_kwh(859.8), 2) == 1.00
    assert round(kwh_to_kcal(1.0), 2) == 859.80
    assert celsius_to_fahrenheit(0) == 32
    assert fahrenheit_to_celsius(32) == 0
    assert round(m2_to_ft2(1), 4) == 10.7639
    assert round(ft2_to_m2(10.7639), 0) == 1
    assert l_h_to_m3_h(1000) == 1.0
    assert m3_h_to_l_h(1) == 1000.0
    assert watts_to_kw(1000) == 1.0
    assert kw_to_watts(1) == 1000.0
    assert round(btu_h_to_kw(3412.14), 2) == 1.00
    assert round(kw_to_btu_h(1.0), 2) == 3412.14


# --- security tests ---
def test_security():
    pwd = "mytestpassword"
    hashed = get_password_hash(pwd)
    assert verify_password(pwd, hashed)
    assert not verify_password("wrongpassword", hashed)

    data = {"sub": "test@example.com"}
    access_token = create_access_token(data, expires_delta=timedelta(minutes=5))
    refresh_token = create_refresh_token(data, expires_delta=timedelta(days=1))

    decoded_access = decode_token(access_token)
    assert decoded_access is not None
    assert decoded_access["sub"] == "test@example.com"

    decoded_refresh = decode_token(refresh_token)
    assert decoded_refresh is not None
    assert decoded_refresh["sub"] == "test@example.com"

    assert decode_token("invalid_token") is None


# --- plans tests ---
def test_plans():
    free_plan = get_plan_config("free")
    assert free_plan["max_simulations_per_month"] == 5

    pro_plan = get_plan_config("pro")
    assert pro_plan["max_simulations_per_month"] == -1

    unknown_plan = get_plan_config("unknown")
    assert unknown_plan["max_simulations_per_month"] == 5


# --- stripe config tests ---
def test_stripe_config():
    assert STRIPE_SECRET_KEY is not None
    assert "pro" in PRICE_IDS
