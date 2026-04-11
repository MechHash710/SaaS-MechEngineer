from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from core import BaseCalculator, CalculationResult, CalculationStep
from core.quota import check_quota
from core.unit_converter import FATOR_KCAL_PARA_KWH
from core.validators import ValidationAlert, validate_solar_inputs
from services.solar_service import obter_fator_solar

router = APIRouter()

# ─── Modelos (Inputs e Outputs) ───────────────────────────────────────────────


class SolarHeatingInput(BaseModel):
    localizacao: str = Field(..., description="Cidade e Estado para buscar irradiação GHI")
    num_peoples: int = Field(4, ge=1, description="Número de ocupantes")
    consumo_por_pessoa: float = Field(50.0, ge=10.0, description="Consumo L/dia por pessoa")
    temp_fria: float = Field(20.0, description="Temperatura média da água da rede")
    temp_quente: float = Field(45.0, description="Temperatura final de mistura desejada")
    tipo_sistema: str = Field(
        "circulacao_natural", description="'circulacao_natural' (Termossifão) ou 'forcada'"
    )
    tipo_coletor: str = Field("plano", description="'plano' ou 'vacuo'")
    orientacao_telhado: str = Field("Norte", description="Norte, Sul, Leste, Oeste...")
    inclinacao_telhado: float = Field(22.0, description="Inclinação em graus")
    insolacao_kwh_m2_dia: float | None = Field(None, ge=0, description="Opcional: Irradiação solar direta")
    tarifa_kwh: float = Field(0.95, ge=0, description="Opcional: Tarifa de energia local")


class SolarHeatingOutput(BaseModel):
    consumo_diario_l: float
    energia_necessaria_kwh_dia: float
    area_coletores_m2: float
    volume_boiler_l: float
    num_coletores: int
    fracao_solar: float
    economia_mensal_kwh: float
    economia_anual_brl: float
    recomendacao_sistema: str
    step_by_step: dict
    constants_used: dict
    references: list[str]
    warnings: list[ValidationAlert] = []


# ─── Constantes de Engenharia ────────────────────────────────────────────────

CALOR_ESPECIFICO_AGUA = 1.0  # kcal/(kg.°C)
DENSIDADE_AGUA = 1.0  # kg/L
EFICIENCIA_PLANO = 0.50  # 50%
EFICIENCIA_VACUO = 0.65  # 65%
FRACAO_SOLAR_ALVO = 0.75  # 75% da energia total provida pelo sol
TARIFA_ENERGIA_MEDIA = 0.95  # R$ / kWh
FATOR_SOBRA_BOILER = 1.2  # Volume recomendável é 20% a mais (NBR)
GHI_FALLBACK = 4.5  # kWh/m2/dia (Média global Brasil se API falhar)

# ─── Calculador Modular ──────────────────────────────────────────────────────


class SolarHeatingCalculator(BaseCalculator):
    def validate_inputs(self, data: SolarHeatingInput) -> list[ValidationAlert]:
        return validate_solar_inputs(data)

    async def calculate(self, data: SolarHeatingInput) -> CalculationResult:
        warnings = self.validate_inputs(data)

        # ── Passo 1: Captura de Radiação Solar (GHI) Real ──
        if data.insolacao_kwh_m2_dia is not None:
            ghi_dia = data.insolacao_kwh_m2_dia
            fonte_ghi = "Entrada Direta Usuário"
        else:
            solar_info = await obter_fator_solar(data.localizacao, None)
            ghi_dia = solar_info.get("ghi_kWh_dia") or GHI_FALLBACK
            fonte_ghi = solar_info.get("fonte", "Fallback Nativo")

        # ── Passo 2: Consumo Diário de Água Quente (L) ──
        vol_diario = data.num_peoples * data.consumo_por_pessoa

        # ── Passo 3: Volume do Boiler Recomendado (L) ──
        vol_boiler = vol_diario * FATOR_SOBRA_BOILER

        # ── Passo 4: Carga Térmica Necessária Diária (Kcal e kWh) ──
        delta_t = data.temp_quente - data.temp_fria
        massa_agua = vol_diario * DENSIDADE_AGUA
        carga_kcal_dia = massa_agua * CALOR_ESPECIFICO_AGUA * delta_t
        energia_necessaria_kwh_dia = carga_kcal_dia / FATOR_KCAL_PARA_KWH

        # ── Passo 5: Área de Placas Solares (m²) ──
        rendimento = EFICIENCIA_VACUO if data.tipo_coletor == "vacuo" else EFICIENCIA_PLANO
        area_necessaria = (energia_necessaria_kwh_dia * FRACAO_SOLAR_ALVO) / (ghi_dia * rendimento)

        # Perdas por orientação e inclinação não ideais (simplificação)
        fator_inclinacao = 1.0
        if data.orientacao_telhado.lower() != "norte":
            fator_inclinacao = 0.85  # Assume ~15% perda se não for Norte perfeito

        area_corrigida = area_necessaria / fator_inclinacao

        # Quantidade de placas (Assumindo placa genérica de 2.0 m² — mas usando a area real)
        area_coletor_padrao_m2 = 2.0  # m² por painel (padrão de mercado)
        num_placas = max(1, round(area_corrigida / area_coletor_padrao_m2))
        area_instalada = round(area_corrigida, 2)  # Usa a área calculada real, não múltiplo fixo

        # Recalculando Fração Solar Efetiva
        energia_solar_captada = area_instalada * ghi_dia * rendimento * fator_inclinacao
        fracao_solar_efetiva = min(1.0, energia_solar_captada / energia_necessaria_kwh_dia)

        # ── Passo 6: Análise Financeira ──
        tarifa = data.tarifa_kwh
        economia_mes_kwh = (energia_necessaria_kwh_dia * fracao_solar_efetiva) * 30.5
        economia_ano_brl = (economia_mes_kwh * 12) * tarifa

        # ── Respostas ──
        tipo_sistema_legivel = (
            "Termossifão (Natural)"
            if data.tipo_sistema == "circulacao_natural"
            else "Circulação Forçada"
        )
        tipo_coletor_legivel = (
            "Tubo a Vácuo" if data.tipo_coletor == "vacuo" else "Plano (Vidro/Cobre)"
        )

        recomendacao = (
            f"Sistema {tipo_sistema_legivel} com Reservatório Térmico (Boiler) de {int(vol_boiler)} L, "
            f"acoplado a {num_placas}x Coletores Solares tipo {tipo_coletor_legivel} (~2m² cada)."
        )

        steps = [
            CalculationStep(
                step_name="V_dia: Consumo [L/dia]",
                formula="pessoas * consumo_pessoa",
                inputs={"pessoas": data.num_peoples, "consumo": data.consumo_por_pessoa},
                result=f"{data.num_peoples} p. × {data.consumo_por_pessoa} = {int(vol_diario)} L",
                unit="L/dia",
                norm_reference="NBR 15569 Tabela 1",
            ),
            CalculationStep(
                step_name="ΔT: Gradiente Térmico [°C]",
                formula="t_quente - t_fria",
                inputs={"q": data.temp_quente, "f": data.temp_fria},
                result=f"{data.temp_quente}°C - {data.temp_fria}°C = {delta_t}°C",
                unit="°C",
                norm_reference="Princípios de Termodinâmica",
            ),
            CalculationStep(
                step_name="Q_dia: Calor [kcal/dia]",
                formula="m * c * dt",
                inputs={"m": massa_agua, "c": CALOR_ESPECIFICO_AGUA, "dt": delta_t},
                result=f"{int(vol_diario)}kg × 1 × {delta_t} = {int(carga_kcal_dia)} kcal",
                unit="kcal/dia",
                norm_reference="NBR 15569 §4.1",
            ),
            CalculationStep(
                step_name="E_dia: Energia [kWh/dia]",
                formula="kcal / 859.8",
                inputs={"kcal": carga_kcal_dia},
                result=f"{int(carga_kcal_dia)} / 859.8 = {round(energia_necessaria_kwh_dia, 2)} kWh",
                unit="kWh/dia",
                norm_reference="NBR 15569 §4.1",
            ),
            CalculationStep(
                step_name="Irradiação Solar GHI [kWh/m²/dia]",
                formula="N/A",
                inputs={"localizacao": data.localizacao},
                result=f"{ghi_dia} ({fonte_ghi})",
                unit="kWh/m²/dia",
                norm_reference="CRESESB Atlas Solarimétrico",
            ),
            CalculationStep(
                step_name="Área Mínima [m²]",
                formula="(E * fracao) / (GHI * rend)",
                inputs={
                    "E": energia_necessaria_kwh_dia,
                    "fracao": FRACAO_SOLAR_ALVO,
                    "ghi": ghi_dia,
                    "rend": rendimento,
                },
                result=f"({round(energia_necessaria_kwh_dia, 2)} × {FRACAO_SOLAR_ALVO}) / ({ghi_dia} × {rendimento}) = {round(area_necessaria, 2)} m²",
                unit="m²",
                norm_reference="NBR 15569 §5.2 (F-Chart Simplificado)",
            ),
            CalculationStep(
                step_name="Área c/ Perdas de Telhado [m²]",
                formula="area / fator_inclinacao",
                inputs={"area": area_necessaria, "fator": fator_inclinacao},
                result=round(area_corrigida, 2),
                unit="m²",
                norm_reference="NBR 15569 §5.2",
            ),
        ]

        summary = {
            "consumo_diario_l": vol_diario,
            "energia_necessaria_kwh_dia": round(energia_necessaria_kwh_dia, 2),
            "area_coletores_m2": round(area_instalada, 2),
            "volume_boiler_l": round(vol_boiler, 0),
            "num_coletores": num_placas,
            "fracao_solar": round(fracao_solar_efetiva, 3),
            "economia_mensal_kwh": round(economia_mes_kwh, 0),
            "economia_anual_brl": round(economia_ano_brl, 2),
            "recomendacao_sistema": recomendacao,
        }

        constants = {
            "Calor Específico Água": "1.0 kcal/kg°C",
            "Conversão kcal -> kWh": "/ 859.8",
            "Sobra de Design (Boiler)": "+20%",
            "Rendimento Coletor Adotado": f"{int(rendimento * 100)}%",
            "Fração Solar de Meta": f"{int(FRACAO_SOLAR_ALVO * 100)}%",
            "Tarifa de Eletricidade": f"R$ {TARIFA_ENERGIA_MEDIA}/kWh",
        }

        references = [
            "ABNT NBR 15569: Sistemas de aquecimento solar de água em circuito direto — Projeto e instalação",
            "Princípios de Termodinâmica: Q = m.c.ΔT",
            "Metodologia F-Chart simplificada para estimativa de Fração Solar",
        ]

        metadata = {"constants_used": constants, "references": references}

        return CalculationResult(steps=steps, summary=summary, warnings=warnings, metadata=metadata)

    def format_results(self, result: CalculationResult) -> SolarHeatingOutput:
        step_by_step = {
            step.step_name: {
                "value": step.result,
                "formula": step.formula,
                "norm_reference": step.norm_reference
            }
            for step in result.steps
        }

        return SolarHeatingOutput(
            consumo_diario_l=result.summary["consumo_diario_l"],
            energia_necessaria_kwh_dia=result.summary["energia_necessaria_kwh_dia"],
            area_coletores_m2=result.summary["area_coletores_m2"],
            volume_boiler_l=result.summary["volume_boiler_l"],
            num_coletores=result.summary["num_coletores"],
            fracao_solar=result.summary["fracao_solar"],
            economia_mensal_kwh=result.summary["economia_mensal_kwh"],
            economia_anual_brl=result.summary["economia_anual_brl"],
            recomendacao_sistema=result.summary["recomendacao_sistema"],
            step_by_step=step_by_step,
            constants_used=result.metadata["constants_used"],
            references=result.metadata["references"],
            warnings=result.warnings,
        )


# ─── Endpoint ─────────────────────────────────────────────────────────────────


@router.post("/calculate_solar", response_model=SolarHeatingOutput)
async def calculate_solar_heating(
    data: SolarHeatingInput, user=Depends(check_quota("run_simulation"))
):
    """
    Dimensionamento de Aquecimento Solar de Água Quente Sanitária (AQS)
    Embasado na metodologia NBR 15569.
    """
    calculator = SolarHeatingCalculator()
    result = await calculator.calculate(data)
    return calculator.format_results(result)
