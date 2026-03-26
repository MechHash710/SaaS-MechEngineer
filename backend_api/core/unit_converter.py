"""
unit_converter.py
Funções de conversão centralizadas para as unidades usadas no projeto.
"""

# Prefixos e multiplicadores exatos
FATOR_WATT_PARA_BTU = 3.41214
FATOR_KCAL_PARA_KWH = 859.8


def watts_to_btu_h(watts: float) -> float:
    return watts * FATOR_WATT_PARA_BTU


def btu_h_to_watts(btu: float) -> float:
    return btu / FATOR_WATT_PARA_BTU


def kcal_to_kwh(kcal: float) -> float:
    return kcal / FATOR_KCAL_PARA_KWH


def kwh_to_kcal(kwh: float) -> float:
    return kwh * FATOR_KCAL_PARA_KWH


def celsius_to_fahrenheit(c: float) -> float:
    return (c * 9 / 5) + 32


def fahrenheit_to_celsius(f: float) -> float:
    return (f - 32) * 5 / 9


def m2_to_ft2(m2: float) -> float:
    return m2 * 10.7639


def ft2_to_m2(ft2: float) -> float:
    return ft2 / 10.7639


def l_h_to_m3_h(l_h: float) -> float:
    return l_h / 1000.0


def m3_h_to_l_h(m3_h: float) -> float:
    return m3_h * 1000.0


def watts_to_kw(watts: float) -> float:
    return watts / 1000.0


def kw_to_watts(kw: float) -> float:
    return kw * 1000.0


def btu_h_to_kw(btu: float) -> float:
    return watts_to_kw(btu_h_to_watts(btu))


def kw_to_btu_h(kw: float) -> float:
    return watts_to_btu_h(kw_to_watts(kw))
