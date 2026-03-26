from enum import Enum

from pydantic import BaseModel


class Severity(str, Enum):
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"


class ValidationAlert(BaseModel):
    severity: Severity
    message: str


def validate_hvac_inputs(data) -> list[ValidationAlert]:
    alerts = []
    if data.pe_direito > 4.0:
        alerts.append(
            ValidationAlert(
                severity=Severity.WARNING,
                message=f"Pé-direito de {data.pe_direito}m é elevado. O modelo simplificado NBR 16401 pode subdimensionar a carga. Recomenda-se cálculo volumétrico detalhado.",
            )
        )
    if data.watts_per_equipment > 2000:
        alerts.append(
            ValidationAlert(
                severity=Severity.WARNING,
                message="Carga de equipamentos extremamente alta. Verifique se o valor informado (W) não é, na verdade, BTU/h ou de equipamentos intermitentes.",
            )
        )
    return alerts


def validate_hvac_results(total_btu: float, area_m2: float) -> list[ValidationAlert]:
    alerts = []
    btu_por_m2 = total_btu / area_m2 if area_m2 > 0 else 0
    if total_btu < 0:
        alerts.append(
            ValidationAlert(
                severity=Severity.CRITICAL,
                message="Carga térmica calculada negativa. Verifique os dados de entrada.",
            )
        )

    if 0 < btu_por_m2 < 300:  # Changed from 200 to 300 to be more sensitive to standard offices
        alerts.append(
            ValidationAlert(
                severity=Severity.INFO,
                message=f"A densidade de carga térmica ({btu_por_m2:.0f} BTU/m²) está no limite inferior. Condizente apenas para locais com baixa ocupação e ótima envoltória térmica.",
            )
        )
    elif btu_por_m2 > 2000:
        alerts.append(
            ValidationAlert(
                severity=Severity.WARNING,
                message=f"Densidade de carga altíssima ({btu_por_m2:.0f} BTU/m²). Sugere ambiente com forte insolação (ex: teto/vidros) ou altíssima densidade de ocupação/equipamentos.",
            )
        )

    if total_btu > 500000:
        alerts.append(
            ValidationAlert(
                severity=Severity.CRITICAL,
                message=f"Carga de {total_btu:,.0f} BTU/h ({total_btu / 12000:,.0f} TR) excede limite seguro do método simplificado. Utilize simulação dinâmica (EnergyPlus, HAP).",
            )
        )
    return alerts


def validate_solar_inputs(data) -> list[ValidationAlert]:
    alerts = []
    if data.consumo_por_pessoa > 100:
        alerts.append(
            ValidationAlert(
                severity=Severity.WARNING,
                message=f"Adoção de {data.consumo_por_pessoa} L/dia/pessoa sugere padrão de alto luxo ou banheiras. Padrão ABNT varia entre 40-80 L.",
            )
        )
    if data.temp_quente > 60:
        alerts.append(
            ValidationAlert(
                severity=Severity.CRITICAL,
                message="Temperaturas de acumulação > 60°C aumentam drasticamente o risco de calcificação precoce nos coletores e perda de eficiência térmica do sistema.",
            )
        )
    if data.inclinacao_telhado < 10:
        alerts.append(
            ValidationAlert(
                severity=Severity.INFO,
                message="Inclinação < 10° dificulta a auto-limpeza do vidro pela chuva e diminui o rendimento fototérmico no longo prazo.",
            )
        )
    return alerts
