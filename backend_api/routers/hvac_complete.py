from typing import Any

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from core import BaseCalculator, CalculationResult, CalculationStep
from core.quota import check_quota
from core.validators import ValidationAlert
from routers.simulation import HvacCalculator, ThermalInput
from routers.ventilation import VentilationCalculator, VentilationInput

router = APIRouter()


class HVACCompleteInput(BaseModel):
    area_m2: float = Field(..., gt=0)
    pe_direito: float = Field(2.7, gt=0)
    num_peoples: int = Field(..., ge=0)
    num_equipment: int = Field(0, ge=0)
    watts_per_equipment: float = Field(150.0, ge=0)
    sun_exposure: str = Field("nenhuma")
    localizacao: str = Field("")
    environment_type: str = Field("escritorio")
    distancia_tubulacao_m: float = Field(..., gt=0)


class HVACCompleteOutput(BaseModel):
    carga_termica_btu_h: float
    vazao_ar_m3h: float
    equipamento_recomendado: str
    eficiencia_estimada: str
    potencia_eletrica_estimada_w: float
    duto_diametro_mm: float
    tubulacao_liquida: str
    tubulacao_succao: str
    comprimento_tubulacao_m: float
    step_by_step: dict[str, Any]
    warnings: list[ValidationAlert]
    constants_used: dict[str, Any]
    references: list[str]


class HVACCompleteCalculator(BaseCalculator):
    def validate_inputs(self, data: HVACCompleteInput) -> list[ValidationAlert]:
        warnings = []
        if data.distancia_tubulacao_m > 30:
            warnings.append(
                ValidationAlert(
                    severity="warning",
                    message="Distância de tubulação frigorífica > 30m. Pode ser necessário sifão ou VRF dependendo do desnível.",
                )
            )
        return warnings

    async def calculate(self, data: HVACCompleteInput) -> CalculationResult:
        warnings = self.validate_inputs(data)

        # 1. Chamar HvacCalculator
        calc_termico = HvacCalculator()
        termico_input = ThermalInput(
            area_m2=data.area_m2,
            pe_direito=data.pe_direito,
            num_peoples=data.num_peoples,
            num_equipment=data.num_equipment,
            watts_per_equipment=data.watts_per_equipment,
            sun_exposure=data.sun_exposure,
            localizacao=data.localizacao,
        )
        res_termico = await calc_termico.calculate(termico_input)

        # 2. Chamar VentilationCalculator
        calc_vent = VentilationCalculator()
        vent_input = VentilationInput(
            area_m2=data.area_m2,
            pe_direito=data.pe_direito,
            num_peoples=data.num_peoples,
            environment_type=data.environment_type,
        )
        res_vent = await calc_vent.calculate(vent_input)

        # Merge warnings
        warnings.extend(res_termico.warnings)
        warnings.extend(res_vent.warnings)

        # Extrair dados principais
        btu_total = res_termico.summary["total_btu"]
        vazao_m3h = res_vent.summary["vazao_ar_externo_m3h"]
        diametro_duto = res_vent.summary["diametro_duto_principal_mm"]

        # 3. Seleção de Equipamento e Tubulação
        # Estimativas baseadas nas boas práticas do mercado
        if btu_total <= 12000:
            equip = "1x Split Hi-Wall Inverter 12.000 BTU/h"
            liquida = '1/4"'
            succao = '3/8"'
            cop = 3.2
        elif btu_total <= 18000:
            equip = "1x Split Hi-Wall Inverter 18.000 BTU/h"
            liquida = '1/4"'
            succao = '1/2"'
            cop = 3.2
        elif btu_total <= 24000:
            equip = "1x Split Hi-Wall Inverter 24.000 BTU/h"
            liquida = '1/4"'
            succao = '5/8"'
            cop = 3.0
        elif btu_total <= 36000:
            equip = "1x Split Piso-Teto / Cassete 36.000 BTU/h"
            liquida = '3/8"'
            succao = '5/8"'
            cop = 3.0
        elif btu_total <= 60000:
            equip = "1x Split Piso-Teto / Cassete 60.000 BTU/h"
            liquida = '3/8"'
            succao = '3/4"'
            cop = 2.8
        else:
            equip = f"Sistema VRF ou Fan-Coil Central ({btu_total:,.0f} BTU/h)"
            liquida = "A calcular (depende da rede VRF)"
            succao = "A calcular (depende da rede VRF)"
            cop = 3.8  # VRF is generally more efficient

        potencia_w = (btu_total * 0.293071) / cop

        # Construir passos unificados
        steps = []
        for s in res_termico.steps:
            steps.append(
                CalculationStep(
                    step_name=f"[Carga] {s.step_name}",
                    formula=s.formula,
                    inputs=s.inputs,
                    result=s.result,
                    unit=s.unit,
                    norm_reference=s.norm_reference,
                )
            )
        for s in res_vent.steps:
            steps.append(
                CalculationStep(
                    step_name=f"[Ventilação] {s.step_name}",
                    formula=s.formula,
                    inputs=s.inputs,
                    result=s.result,
                    unit=s.unit,
                    norm_reference=s.norm_reference,
                )
            )

        steps.append(
            CalculationStep(
                step_name="[Tubulação] Distância Linear",
                formula="N/A",
                inputs={"distancia_m": data.distancia_tubulacao_m},
                result=data.distancia_tubulacao_m,
                unit="m",
                norm_reference="Boas Práticas de Instalação (Catálogo Fabricante)",
            )
        )
        steps.append(
            CalculationStep(
                step_name="[Tubulação] Linha Líquida / Sucção",
                formula="Tabela Padrão p/ Capacidade",
                inputs={"BTU_total": btu_total},
                result=f"{liquida} / {succao}",
                unit="pol",
                norm_reference="Padrão Comercial Split Hi-Wall/Cassete",
            )
        )
        steps.append(
            CalculationStep(
                step_name="[Elétrica] Potência de Refrigeração",
                formula="(BTU * 0.293) / COP",
                inputs={"BTU": btu_total, "COP": cop},
                result=round(potencia_w, 2),
                unit="W",
                norm_reference="NBR 16401-1 / Balanço Energético",
            )
        )

        summary = {
            "carga_termica_btu_h": btu_total,
            "vazao_ar_m3h": vazao_m3h,
            "duto_diametro_mm": diametro_duto,
            "tubulacao_liquida": liquida,
            "tubulacao_succao": succao,
            "equipamento_recomendado": equip,
            "eficiencia_estimada": f"COP ≈ {cop:.2f}",
            "potencia_eletrica_estimada_w": round(potencia_w, 2),
            "comprimento_tubulacao_m": data.distancia_tubulacao_m,
        }

        # Unificar constants and references
        constants_used = {
            **res_termico.metadata.get("constants_used", {}),
            **res_vent.metadata.get("constants_used", {}),
        }
        constants_used["COP Estimado (Eficiência)"] = cop

        references = list(
            set(
                res_termico.metadata.get("references", []) + res_vent.metadata.get("references", [])
            )
        )

        metadata = {"constants_used": constants_used, "references": references}

        return CalculationResult(steps=steps, summary=summary, warnings=warnings, metadata=metadata)

    def format_results(self, result: CalculationResult) -> HVACCompleteOutput:
        return HVACCompleteOutput(
            carga_termica_btu_h=result.summary["carga_termica_btu_h"],
            vazao_ar_m3h=result.summary["vazao_ar_m3h"],
            equipamento_recomendado=result.summary["equipamento_recomendado"],
            eficiencia_estimada=result.summary["eficiencia_estimada"],
            potencia_eletrica_estimada_w=result.summary["potencia_eletrica_estimada_w"],
            duto_diametro_mm=result.summary["duto_diametro_mm"],
            tubulacao_liquida=result.summary["tubulacao_liquida"],
            tubulacao_succao=result.summary["tubulacao_succao"],
            comprimento_tubulacao_m=result.summary["comprimento_tubulacao_m"],
            step_by_step={
                s.step_name: {
                    "value": s.result,
                    "formula": s.formula,
                    "norm_reference": s.norm_reference
                }
                for s in result.steps
            },
            warnings=result.warnings,
            constants_used=result.metadata["constants_used"],
            references=result.metadata["references"],
        )


@router.post("/calculate_hvac_complete", response_model=HVACCompleteOutput)
async def calculate_hvac_complete(
    data: HVACCompleteInput, user=Depends(check_quota("run_simulation"))
):
    """
    Cálculo de HVAC Completo: Carga Térmica (NBR 16401-1) + Ventilação (NBR 16401-3/ASHRAE 62.1) + Pré-seleção de Equipamentos e Dutos
    """
    calc = HVACCompleteCalculator()
    res = await calc.calculate(data)
    return calc.format_results(res)
