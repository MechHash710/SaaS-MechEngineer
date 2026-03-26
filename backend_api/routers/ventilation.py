import math

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from core import BaseCalculator, CalculationResult, CalculationStep
from core.quota import check_quota
from core.validators import ValidationAlert

router = APIRouter()


class VentilationInput(BaseModel):
    area_m2: float = Field(..., gt=0)
    pe_direito: float = Field(2.7, gt=0)
    num_peoples: int = Field(..., ge=0)
    environment_type: str = Field(
        "escritorio", description="'escritorio', 'auditorio', 'sala_aula', 'loja'"
    )


class VentilationOutput(BaseModel):
    vazao_ar_externo_m3h: float
    renovacoes_por_hora_ach: float
    diametro_duto_principal_mm: float
    velocidade_duto_m_s: float
    recomendacao: str
    step_by_step: dict
    constants_used: dict
    references: list[str]
    warnings: list[ValidationAlert]


# Constants based on ASHRAE 62.1 / NBR 16401-3
ENV_CONSTANTS = {
    "escritorio": {"Rp": 2.5, "Ra": 0.3},
    "auditorio": {"Rp": 2.5, "Ra": 0.3},
    "sala_aula": {"Rp": 3.8, "Ra": 0.6},
    "loja": {"Rp": 3.8, "Ra": 0.6},
}


class VentilationCalculator(BaseCalculator):
    def validate_inputs(self, data: VentilationInput) -> list[ValidationAlert]:
        warnings = []
        if data.pe_direito < 2.2:
            warnings.append(
                ValidationAlert(
                    severity="warning",
                    message="Pé-direito abaixo de 2.2m pode não atender normas ergonômicas.",
                )
            )
        density = data.area_m2 / max(1, data.num_peoples)
        if density < 1.0:
            warnings.append(
                ValidationAlert(
                    severity="critical",
                    message="Alta densidade ocupacional detectada (< 1m²/pessoa).",
                )
            )
        return warnings

    async def calculate(self, data: VentilationInput) -> CalculationResult:
        warnings = self.validate_inputs(data)

        env = ENV_CONSTANTS.get(data.environment_type, ENV_CONSTANTS["escritorio"])
        rp_l_s = env["Rp"]
        ra_l_s = env["Ra"]

        # 1. Vazão de Ar Externo Pessoas
        q_pessoas_l_s = data.num_peoples * rp_l_s

        # 2. Vazão de Ar Externo Área
        q_area_l_s = data.area_m2 * ra_l_s

        # 3. Vazão Total L/s
        q_total_l_s = q_pessoas_l_s + q_area_l_s

        # 4. Vazão Total m3/h
        q_total_m3h = q_total_l_s * 3.6

        # 5. Volume do Ambiente
        volume_m3 = data.area_m2 * data.pe_direito

        # 6. Renovações por hora (ACH)
        ach = q_total_m3h / volume_m3 if volume_m3 > 0 else 0
        if ach < 1.0:
            warnings.append(
                ValidationAlert(
                    severity="warning",
                    message="Taxa de renovação de ar (ACH) muito baixa (< 1.0). Considere aumentar a vazão ou rever as premissas.",
                )
            )

        # 7. Dimensionamento de Dutos (Método de Velocidade)
        # Velocidade recomendada para duto principal (suprimento ar externo) ~ 4.0 a 5.0 m/s
        v_duto = 4.5  # m/s (Constante assumida)
        q_total_m3s = q_total_l_s / 1000.0

        area_duto_m2 = q_total_m3s / v_duto

        # Diametro eq (A = pi * r^2 -> r = sqrt(A / pi) -> d = 2 * r)
        diametro_m = 2 * math.sqrt(area_duto_m2 / math.pi)
        diametro_mm = diametro_m * 1000

        # Normalization to commecial nominal diameters (e.g. multiples of 50mm)
        diametro_comercial_mm = math.ceil(diametro_mm / 50.0) * 50

        recomendacao = f"Vazão de Ar Externo: {q_total_m3h:.0f} m³/h. Recomenda-se ventilador com duto principal circular de ø {diametro_comercial_mm:.0f} mm."

        steps = [
            CalculationStep(
                step_name="Q_pessoas [L/s]",
                formula="Pessoas * Rp",
                inputs={"pessoas": data.num_peoples, "Rp": rp_l_s},
                result=q_pessoas_l_s,
                unit="L/s",
                norm_reference="NBR 16401-3 Tabela 1 / ASHRAE 62.1 Tabela 6-1",
            ),
            CalculationStep(
                step_name="Q_area [L/s]",
                formula="Area * Ra",
                inputs={"area": data.area_m2, "Ra": ra_l_s},
                result=round(q_area_l_s, 2),
                unit="L/s",
                norm_reference="NBR 16401-3 Tabela 1 / ASHRAE 62.1 Tabela 6-1",
            ),
            CalculationStep(
                step_name="Q_total [L/s]",
                formula="Q_pessoas + Q_area",
                inputs={},
                result=round(q_total_l_s, 2),
                unit="L/s",
                norm_reference="NBR 16401-3 Tabela 1",
            ),
            CalculationStep(
                step_name="Q_total [m³/h]",
                formula="Q_total * 3.6",
                inputs={},
                result=round(q_total_m3h, 2),
                unit="m³/h",
                norm_reference="NBR 16401-3 Tabela 1",
            ),
            CalculationStep(
                step_name="Volume [m³]",
                formula="Area * Pe_Direito",
                inputs={"area": data.area_m2, "pe_direito": data.pe_direito},
                result=round(volume_m3, 2),
                unit="m³",
                norm_reference="Geometria do Ambiente",
            ),
            CalculationStep(
                step_name="ACH [1/h]",
                formula="Q_total_m3h / Volume",
                inputs={},
                result=round(ach, 2),
                unit="1/h",
                norm_reference="NBR 16401-3 §6 (Renovação Mínima)",
            ),
            CalculationStep(
                step_name="A_duto [m²]",
                formula="Q_m3s / V_recomendada",
                inputs={"V_rec": v_duto},
                result=round(area_duto_m2, 4),
                unit="m²",
                norm_reference="ASHRAE Fundamentals 2021, Cap. 21",
            ),
            CalculationStep(
                step_name="Ø_eq [mm]",
                formula="sqrt(4 * A / pi) * 1000",
                inputs={},
                result=round(diametro_mm, 2),
                unit="mm",
                norm_reference="ASHRAE Fundamentals 2021, Cap. 21 (Dutos)",
            ),
        ]

        summary = {
            "vazao_ar_externo_m3h": round(q_total_m3h, 2),
            "renovacoes_por_hora_ach": round(ach, 2),
            "diametro_duto_principal_mm": diametro_comercial_mm,
            "velocidade_duto_m_s": v_duto,
            "recomendacao": recomendacao,
        }

        metadata = {
            "constants_used": {
                "Taxa Ocupacional (Rp)": f"{rp_l_s} L/s por pessoa",
                "Taxa de Área (Ra)": f"{ra_l_s} L/s por m²",
                "Velocidade Duto (V)": f"{v_duto} m/s",
                "Tipo de Ambiente": data.environment_type,
            },
            "references": [
                "ABNT NBR 16401-3: Qualidade do Ar Interior",
                "ASHRAE Standard 62.1: Ventilation for Acceptable Indoor Air Quality",
            ],
        }

        return CalculationResult(steps=steps, summary=summary, warnings=warnings, metadata=metadata)

    def format_results(self, result: CalculationResult) -> VentilationOutput:
        return VentilationOutput(
            vazao_ar_externo_m3h=result.summary["vazao_ar_externo_m3h"],
            renovacoes_por_hora_ach=result.summary["renovacoes_por_hora_ach"],
            diametro_duto_principal_mm=result.summary["diametro_duto_principal_mm"],
            velocidade_duto_m_s=result.summary["velocidade_duto_m_s"],
            recomendacao=result.summary["recomendacao"],
            step_by_step={
                s.step_name: {
                    "value": s.result,
                    "formula": s.formula,
                    "norm_reference": s.norm_reference
                }
                for s in result.steps
            },
            constants_used=result.metadata["constants_used"],
            references=result.metadata["references"],
            warnings=result.warnings,
        )


@router.post("/calculate_ventilation", response_model=VentilationOutput)
async def calculate_ventilation(
    data: VentilationInput, user=Depends(check_quota("run_simulation"))
):
    """
    Cálculo de Vazão de Ar Externo e Dimensionamento Básico de Dutos conforme NBR 16401-3.
    """
    calc = VentilationCalculator()
    res = await calc.calculate(data)
    return calc.format_results(res)
