from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from core import BaseCalculator, CalculationResult, CalculationStep
from core.quota import check_quota
from core.validators import ValidationAlert

router = APIRouter()


class EnergyEfficiencyInput(BaseModel):
    area_m2: float = Field(..., gt=0)
    iluminacao_w_m2: float = Field(
        ..., gt=0, description="Densidade de Potência de Iluminação (W/m²)"
    )
    ar_condicionado_cop: float = Field(..., gt=0, description="Coeficiente de Performance (COP)")
    fator_vidro_percent: float = Field(
        ..., ge=0, le=100, description="Percentual de vidro na fachada (%)"
    )
    horas_uso_dia: float = Field(default=10, gt=0, le=24)
    dias_uso_ano: int = Field(default=250, gt=0, le=365)


class EnergyEfficiencyOutput(BaseModel):
    consumo_anual_kwh: float
    score_eficiencia: str
    indicador_kwh_m2_ano: float
    recomendacao: str
    step_by_step: dict
    constants_used: dict
    references: list[str]
    warnings: list[ValidationAlert]


class EnergyEfficiencyCalculator(BaseCalculator):
    def validate_inputs(self, data: EnergyEfficiencyInput) -> list[ValidationAlert]:
        warnings = []
        if data.iluminacao_w_m2 > 20:
            warnings.append(
                ValidationAlert(
                    severity="warning",
                    message="Densidade de iluminação alta (> 20 W/m²). Considere uso de LED.",
                )
            )
        if data.ar_condicionado_cop < 2.5:
            warnings.append(
                ValidationAlert(
                    severity="critical",
                    message="COP do sistema de ar condicionado muito baixo. Troca de equipamento recomendada para obter classificação melhor.",
                )
            )
        if data.fator_vidro_percent > 60:
            warnings.append(
                ValidationAlert(
                    severity="warning",
                    message="Grande área envidraçada. Carga térmica excessiva sem vidros especiais.",
                )
            )
        return warnings

    async def calculate(self, data: EnergyEfficiencyInput) -> CalculationResult:
        warnings = self.validate_inputs(data)

        # 1. Consumo anual Iluminação
        potencia_iluminacao_kw = (data.iluminacao_w_m2 * data.area_m2) / 1000.0
        consumo_iluminacao_ano = potencia_iluminacao_kw * data.horas_uso_dia * data.dias_uso_ano

        # 2. Consumo anual Ar Condicionado (estimativa simplificada baseada em carga média de 70W/m2)
        # REDUÇÃO: de 100W/m2 para 70W/m2 para refletir padrões modernos de eficiência.
        carga_termica_w = data.area_m2 * 70.0
        # Ajuste de carga por fator de vidro (cada 1% acima de 20% adiciona 0.5%)
        fator_ajuste_vidro = 1.0 + max(0, (data.fator_vidro_percent - 20) * 0.005)
        carga_termica_ajustada = carga_termica_w * fator_ajuste_vidro

        consumo_ac_kw = (carga_termica_ajustada / data.ar_condicionado_cop) / 1000.0
        # O AC não necessariamente liga todas as horas, assumimos 70% do tempo de uso
        consumo_ac_ano = consumo_ac_kw * (data.horas_uso_dia * 0.7) * data.dias_uso_ano

        # 3. Consumo Equipamentos (fator médio de 15 W/m2)
        consumo_equip_kw = (15.0 * data.area_m2) / 1000.0
        consumo_equip_ano = consumo_equip_kw * data.horas_uso_dia * data.dias_uso_ano

        # 4. Consumo Total Anual
        consumo_total_anual = consumo_iluminacao_ano + consumo_ac_ano + consumo_equip_ano

        # 5. Indicador kWh/m².ano
        indicador = consumo_total_anual / data.area_m2

        # 6. Score Simplificado INI-C
        score = "E"
        if indicador < 50:
            score = "A"
        elif indicador < 80:
            score = "B"
        elif indicador < 120:
            score = "C"
        elif indicador < 160:
            score = "D"

        recomendacao = f"Classificação estimada: Nível {score}. O sistema consome aproximadamente {indicador:.0f} kWh/m².ano."
        if score in ["D", "E"]:
            recomendacao += " Recomenda-se retrofit de iluminação ou substituição de sistema AVAC."

        steps = [
            CalculationStep(
                step_name="Carga Iluminação [kW]",
                formula="(W/m² * Area) / 1000",
                inputs={"W/m²": data.iluminacao_w_m2, "area": data.area_m2},
                result=round(potencia_iluminacao_kw, 2),
                unit="kW",
                norm_reference="INI-C §4.2",
            ),
            CalculationStep(
                step_name="Consumo Ilum. [kWh/ano]",
                formula="Carga * Horas * Dias",
                inputs={},
                result=round(consumo_iluminacao_ano, 2),
                unit="kWh/ano",
                norm_reference="INI-C §4.2",
            ),
            CalculationStep(
                step_name="Carga Tér. Ajustada [kW]",
                formula="Area * 70 * F_vidro / 1000",
                inputs={"F_vidro": fator_ajuste_vidro},
                result=round(carga_termica_ajustada / 1000.0, 2),
                unit="kW",
                norm_reference="INI-C §4.3",
            ),
            CalculationStep(
                step_name="Consumo AC [kWh/ano]",
                formula="(Carga / COP) * Horas_Red * Dias",
                inputs={"COP": data.ar_condicionado_cop},
                result=round(consumo_ac_ano, 2),
                unit="kWh/ano",
                norm_reference="INI-C §5",
            ),
            CalculationStep(
                step_name="Consumo Total [kWh/ano]",
                formula="Ilum. + AC + Equipamentos",
                inputs={},
                result=round(consumo_total_anual, 2),
                unit="kWh",
                norm_reference="INI-C §6",
            ),
            CalculationStep(
                step_name="Indicador [kWh/m².ano]",
                formula="Consumo Total / Area",
                inputs={},
                result=round(indicador, 2),
                unit="kWh/m².ano",
                norm_reference="INI-C §6",
            ),
        ]

        summary = {
            "consumo_anual_kwh": round(consumo_total_anual, 2),
            "score_eficiencia": score,
            "indicador_kwh_m2_ano": round(indicador, 2),
            "recomendacao": recomendacao,
        }

        metadata = {
            "constants_used": {
                "Carga AC Média (Base)": "70 W/m²",
                "Carga Equipamentos": "15 W/m²",
                "Fator de Uso do AC": "70% do tempo de operação",
            },
            "references": [
                "Instrução Normativa INI-C (Eficiência Energética Edificações Comerciais)",
                "PBE Edifica - Nível de Eficiência",
            ],
        }

        return CalculationResult(steps=steps, summary=summary, warnings=warnings, metadata=metadata)

    def format_results(self, result: CalculationResult) -> EnergyEfficiencyOutput:
        return EnergyEfficiencyOutput(
            consumo_anual_kwh=result.summary["consumo_anual_kwh"],
            score_eficiencia=result.summary["score_eficiencia"],
            indicador_kwh_m2_ano=result.summary["indicador_kwh_m2_ano"],
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


@router.post("/calculate_efficiency", response_model=EnergyEfficiencyOutput)
async def calculate_efficiency(
    data: EnergyEfficiencyInput, user=Depends(check_quota("run_simulation"))
):
    """
    Simulador de Eficiência Energética para estimar indicador (kWh/m².ano) e Ence.
    """
    calc = EnergyEfficiencyCalculator()
    res = await calc.calculate(data)
    return calc.format_results(res)
