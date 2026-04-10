from fastapi import APIRouter, Depends
from pydantic import BaseModel

from core import BaseCalculator, CalculationResult, CalculationStep
from core.quota import check_quota
from core.unit_converter import FATOR_WATT_PARA_BTU
from core.validators import ValidationAlert, validate_hvac_inputs, validate_hvac_results
from services.solar_service import FATOR_FALLBACK, obter_fator_solar

router = APIRouter()

# ─── Constantes Técnicas ─────────────────────────────────────────────────────
# Todas as constantes são referenciadas a normas técnicas publicadas.
# Regra da skill: "Never invent engineering standards"

# Carga sensível por ocupante (BTU/h) — atividade sedentária/escritório
# Referência: ASHRAE Fundamentals 2021, Table 1, Cap. 18
# "Seated, light work, typing" @ 75°F (24°C): 75W sensível = 255.9 BTU/h
CARGA_SENSIVEL_PESSOA_BTU = 255.0

# Carga latente por ocupante (BTU/h) — atividade sedentária/escritório
# Referência: ASHRAE Fundamentals 2021, Table 1, Cap. 18
# "Seated, light work, typing" @ 75°F (24°C): 56W latente = 190.9 BTU/h
# NOTA: em climas quentes (Brasil), a fração latente aumenta. Usa-se 245 BTU/h
# como valor conservador para climas tropicais (ABRAVA, 2019)
CARGA_LATENTE_PESSOA_BTU = 245.0

# Carga de iluminação artificial padrão (W/m²)
# Referência: NBR 16401-1 §5.2, Tabela 2 — escritório/residencial padrão
# Pode ser sobrescrito pelo usuário no futuro
ILUMINACAO_W_POR_M2 = 10.0

# Pé-direito padrão de referência (metros)
# As tabelas NBR 16401 são calibradas para pé-direito de 2.70m
PE_DIREITO_REFERENCIA = 2.70

# Fator de segurança de projeto (+10%): compensa cargas não modeladas
# (pontes térmicas, infiltração não calculada, envelhecimento do equipamento)
# Alterado de 5% para 10% — mais conservador conforme recomendação da auditoria
FATOR_SEGURANCA = 1.10


# ─── Faixas de Validação (Sanity Checks) ────────────────────────────────────
# Referência: Valores típicos de mercado e normas ASHRAE para climas tropicais

FAIXA_BTU_M2_MIN = 200.0  # Abaixo disso: resultado suspeito
FAIXA_BTU_M2_MAX = 2500.0  # Acima disso: resultado suspeito
FAIXA_BTU_TOTAL_MAX = 500000.0  # 500kBTU = limite para cálculo simplificado


# ─── Modelos ─────────────────────────────────────────────────────────────────


class ThermalInput(BaseModel):
    area_m2: float
    pe_direito: float = 2.70  # metros — default padrão residencial
    num_peoples: int
    num_equipment: int
    watts_per_equipment: float
    sun_exposure: str  # 'manhas', 'tardes', 'dia_todo', 'nenhuma'
    localizacao: str = ""  # Ex: "São Paulo, SP" — opcional


class ProductOption(BaseModel):
    brand_model: str
    type_desc: str
    capacity: str
    efficiency: str
    price_estimate: str
    buy_link: str


class ThermalOutput(BaseModel):
    total_btu_h: float
    total_watts: float
    suggested_equipment: str
    recommended_options: list[ProductOption] = []
    step_by_step: dict
    warnings: list[ValidationAlert] = []  # Alertas de validação para o engenheiro
    constants_used: dict = {}  # Coeficientes extraídos das normas
    references: list[str] = []  # Normas aplicadas


# ─── Calculador Modular ──────────────────────────────────────────────────────

# Tabela dinâmica de equipamentos de mercado (Março 2026)
def get_dynamic_equipment(btu_capacity: int, total_load: float) -> list[ProductOption]:
    # Formatação helper
    def build_options(c_str: str, p_lg: str, p_samsung: str, p_midea: str, p_budget: str, idrs_lg="6.0+", idrs_sami="7.5+", idrs_mid="5.5+", idrs_bud="5.5", cop_lg="3.5", cop_sami="4.0", cop_mid="3.3", cop_bud="3.2", budget_brand="Aufit (Grupo Midea)"):
        return [
            ProductOption(brand_model="Samsung WindFree Connect", type_desc="Hi-Wall Inverter (Premium)", capacity=c_str, efficiency=f"A (IDRS {idrs_sami} | COP {cop_sami})", price_estimate=p_samsung, buy_link=f"https://www.frigelar.com.br/busca?q=samsung+windfree+{btu_capacity}+inverter"),
            ProductOption(brand_model="LG Dual Inverter Voice +AI", type_desc="Hi-Wall Inverter (Tecnologia)", capacity=c_str, efficiency=f"A (IDRS {idrs_lg} | COP {cop_lg})", price_estimate=p_lg, buy_link=f"https://www.casasbahia.com.br/ar-condicionado-lg-dual-inverter-{btu_capacity}/b"),
            ProductOption(brand_model="Midea AirVolution / Xtreme", type_desc="Hi-Wall Inverter (Robusto)", capacity=c_str, efficiency=f"A (IDRS {idrs_mid} | COP {cop_mid})", price_estimate=p_midea, buy_link=f"https://www.frigelar.com.br/busca?q=midea+inverter+{btu_capacity}"),
            ProductOption(brand_model=budget_brand, type_desc="Hi-Wall Inverter (Custo-Benefício)", capacity=c_str, efficiency=f"A (IDRS {idrs_bud} | COP {cop_bud})", price_estimate=p_budget, buy_link=f"https://www.casasbahia.com.br/ar-condicionado-inverter-{btu_capacity}/b")
        ]

    if btu_capacity <= 9000:
        return build_options("1x 9.000 BTU/h", "R$ 1.692", "R$ 1.849", "R$ 1.649", "R$ 1.319")
    elif btu_capacity <= 12000:
        return build_options("1x 12.000 BTU/h", "R$ 2.184", "R$ 1.991", "R$ 1.789", "R$ 1.743")
    elif btu_capacity <= 18000:
        return build_options("1x 18.000 BTU/h", "R$ 3.134", "R$ 3.569", "R$ 3.172", "R$ 2.499", "TCL / Philco Inverter")
    elif btu_capacity <= 24000:
        return build_options("1x 24.000 BTU/h", "R$ 4.074", "R$ 4.299", "R$ 4.369", "R$ 3.199", "TCL Inverter")
    elif btu_capacity <= 30000:
        return [
            ProductOption(brand_model="Midea Xtreme Save Connect", type_desc="Hi-Wall Inverter", capacity="1x 30.000 BTU/h", efficiency="A (IDRS 6.0 | COP 3.4)", price_estimate="R$ 6.934", buy_link="https://www.leveros.com.br/busca?q=ar+condicionado+30000+btu+inverter+midea"),
            ProductOption(brand_model="LG Dual Inverter", type_desc="Hi-Wall Inverter", capacity="1x 30.000 BTU/h", efficiency="A (IDRS 5.8 | COP 3.3)", price_estimate="R$ 7.100", buy_link="https://www.leveros.com.br/busca?q=lg+30000+inverter")
        ]
    elif btu_capacity <= 36000:
        return [
            ProductOption(brand_model="LG Split Teto Inverter Wi-Fi", type_desc="Piso Teto Inverter", capacity="1x 36.000 BTU/h", efficiency="A (COP 3.4)", price_estimate="R$ 7.789", buy_link="https://www.leveros.com.br/busca?q=lg+teto+36000+inverter"),
            ProductOption(brand_model="Midea Teto Inverter Connect", type_desc="Piso Teto Inverter", capacity="1x 36.000 BTU/h", efficiency="A (COP 3.3)", price_estimate="R$ 7.979", buy_link="https://www.leveros.com.br/busca?q=midea+teto+36000+inverter"),
            ProductOption(brand_model="Samsung Cassete 4 Vias", type_desc="Cassete Inverter", capacity="1x 36.000 BTU/h", efficiency="A (COP 3.8)", price_estimate="R$ 9.949", buy_link="https://www.webcontinental.com.br/busca?q=samsung+cassete+36000+windfree"),
            ProductOption(brand_model="Elgin Eco Logic", type_desc="Piso Teto Inverter", capacity="1x 36.000 BTU/h", efficiency="A (COP 3.2)", price_estimate="R$ 6.500", buy_link="https://www.frigelar.com.br/busca?q=elgin+teto+36000")
        ]
    elif btu_capacity <= 48000:
         return [
            ProductOption(brand_model="Samsung Cassete WindFree", type_desc="Cassete Inverter", capacity="1x 48.000 BTU/h", efficiency="A", price_estimate="R$ 10.499", buy_link="https://www.webcontinental.com.br/busca?q=samsung+cassete+48000"),
            ProductOption(brand_model="Midea Teto Inverter", type_desc="Piso Teto Inverter", capacity="1x 48.000 BTU/h", efficiency="A", price_estimate="R$ 8.900", buy_link="https://www.frigelar.com.br/busca?q=midea+teto+48000+inverter"),
            ProductOption(brand_model="LG Split Teto Inverter", type_desc="Piso Teto Inverter", capacity="1x 48.000 BTU/h", efficiency="A", price_estimate="R$ 9.500", buy_link="https://www.leveros.com.br/busca?q=lg+teto+48000+inverter")
        ]
    elif btu_capacity <= 60000:
         return [
            ProductOption(brand_model="Midea / Carrier Teto", type_desc="Piso Teto Inverter", capacity="1x 60.000 BTU/h", efficiency="A", price_estimate="R$ 9.999", buy_link="https://www.webcontinental.com.br/busca?q=midea+teto+60000"),
            ProductOption(brand_model="LG Split Teto Wi-Fi", type_desc="Piso Teto Inverter", capacity="1x 60.000 BTU/h", efficiency="A", price_estimate="R$ 12.064", buy_link="https://www.leveros.com.br/busca?q=lg+teto+60000"),
            ProductOption(brand_model="Gree Eco", type_desc="Piso Teto (Custo-Benefício)", capacity="1x 60.000 BTU/h", efficiency="B", price_estimate="R$ 8.500", buy_link="https://www.frigelar.com.br/busca?q=gree+teto+60000")
        ]
    else:
        # Acima de 60k, sugerimos multi-split VRF ou múltiplos equipamentos
        num_36 = int(total_load // 36000)
        num_60 = int(total_load // 60000)
        return [
            ProductOption(brand_model="Sistema Multi-Split VRF", type_desc="Central Inverter", capacity=f"Total: {total_load:,.0f} BTU/h", efficiency="A", price_estimate="Sob Consulta", buy_link="#"),
            ProductOption(brand_model="Múltiplos Midea Teto", type_desc="Piso Teto Inverter", capacity=f"{max(2, num_60+1)}x 60.000 BTU/h", efficiency="A", price_estimate="Sob Consulta", buy_link="https://www.webcontinental.com.br/busca?q=midea+teto+60000"),
            ProductOption(brand_model="Múltiplos LG Teto", type_desc="Piso Teto Inverter", capacity=f"{max(2, num_36+1)}x 36.000 BTU/h", efficiency="A", price_estimate="Sob Consulta", buy_link="https://www.leveros.com.br/busca?q=lg+teto+36000")
        ]


class HvacCalculator(BaseCalculator):
    def validate_inputs(self, data: ThermalInput) -> list[ValidationAlert]:
        return validate_hvac_inputs(data)

    async def calculate(self, data: ThermalInput) -> CalculationResult:
        warnings = self.validate_inputs(data)

        # ── Passo 1: Fator de insolação — dinâmico por localização ───────────────
        if data.localizacao.strip():
            solar_info = await obter_fator_solar(data.localizacao, data.sun_exposure)
        else:
            fator_fallback = FATOR_FALLBACK.get(data.sun_exposure, 700.0)
            solar_info = {
                "fator_btu_m2": fator_fallback,
                "ghi_kWh_dia": None,
                "lat": None,
                "lng": None,
                "fonte": "Tabela Fallback NBR 16401 (localização não informada)",
            }

        fator_area_btu_m2 = solar_info["fator_btu_m2"]
        fonte_solar = solar_info["fonte"]
        ghi = solar_info.get("ghi_kWh_dia")

        # ── Passo 2: Carga sensível do envelope (paredes, teto, janelas) ─────────
        # REDUÇÃO: Fatores base ajustados para serem "envelope-only".
        # ABNT NBR 16401-1 aponta que 600-800 BTU/m² total inclui pessoas.
        # Aqui usamos um fator base menor pois somamos pessoas e iluminação depois.
        fator_area_btu_m2_envelope = fator_area_btu_m2 * 0.7  # 70% do fator total é envelope
        carga_area = data.area_m2 * fator_area_btu_m2_envelope

        # ── Passo 3: Fator de correção de pé-direito ────────────────────────────
        fator_pe_direito = data.pe_direito / PE_DIREITO_REFERENCIA
        carga_area_corrigida = carga_area * fator_pe_direito

        # ── Passo 4: Carga sensível de ocupantes ─────────────────────────────────
        carga_pessoas_sensivel = data.num_peoples * CARGA_SENSIVEL_PESSOA_BTU

        # ── Passo 5: Carga latente de ocupantes (umidade) ────────────────────────
        carga_pessoas_latente = data.num_peoples * CARGA_LATENTE_PESSOA_BTU

        # ── Passo 6: Carga de iluminação artificial ──────────────────────────────
        carga_iluminacao = data.area_m2 * ILUMINACAO_W_POR_M2 * FATOR_WATT_PARA_BTU

        # ── Passo 7: Carga de equipamentos elétricos ────────────────────────────
        carga_equipamentos = data.num_equipment * data.watts_per_equipment * FATOR_WATT_PARA_BTU

        # ── Passo 8: Subtotal e fator de segurança de projeto (+10%) ─────────────
        subtotal_btu = (
            carga_area_corrigida
            + carga_pessoas_sensivel
            + carga_pessoas_latente
            + carga_iluminacao
            + carga_equipamentos
        )
        total_btu = round(subtotal_btu * FATOR_SEGURANCA, 2)

        # ── Passo 9: Validação de resultado (Sanity Checks) ─────────────────────
        warnings.extend(validate_hvac_results(total_btu, data.area_m2))

        # ── Construção do CalculationResult ──────────────────────────────────────
        steps = []
        steps.append(
            CalculationStep(
                step_name=f"Localização: {data.localizacao or 'Não informada'}",
                formula="N/A",
                inputs={"localizacao": data.localizacao},
                result=fonte_solar,
                unit="text",
                norm_reference="CRESESB Atlas Solarimétrico",
            )
        )
        if ghi is not None:
            steps.append(
                CalculationStep(
                    step_name="GHI Médio Anual [kWh/m²/dia]",
                    formula="N/A",
                    inputs={},
                    result=ghi,
                    unit="kWh/m²/dia",
                    norm_reference="Open-Meteo ERA5 / CRESESB",
                )
            )

        steps.extend(
            [
                CalculationStep(
                    step_name=f"Fator Solar ({data.sun_exposure}) [BTU/m²]",
                    formula="fator_base * escala",
                    inputs={"sun_exposure": data.sun_exposure},
                    result=fator_area_btu_m2,
                    unit="BTU/m²",
                    norm_reference="NBR 16401-1 Anexo A, Tabela A.1",
                ),
                CalculationStep(
                    step_name=f"Q_env: {data.area_m2}m² × {fator_area_btu_m2_envelope:.1f} [BTU/h]",
                    formula="Area * Fator BTU/m2 (Envelope Only)",
                    inputs={"area": data.area_m2, "fator_envelope": round(fator_area_btu_m2_envelope, 1)},
                    result=round(carga_area, 2),
                    unit="BTU/h",
                    norm_reference="NBR 16401-1 §5.2.1",
                ),
                CalculationStep(
                    step_name=f"Fator Pé-Direito: {data.pe_direito}m / {PE_DIREITO_REFERENCIA}m",
                    formula="pe_direito / REF",
                    inputs={"pe_direito": data.pe_direito},
                    result=round(fator_pe_direito, 3),
                    unit="adimensional",
                    norm_reference="NBR 16401-1 §5.3.2",
                ),
                CalculationStep(
                    step_name="Q_env corrigido [BTU/h]",
                    formula="Q_env * fator_pe_direito",
                    inputs={},
                    result=round(carga_area_corrigida, 2),
                    unit="BTU/h",
                    norm_reference="NBR 16401-1 §5.3.2 (Correção Volumétrica)",
                ),
                CalculationStep(
                    step_name=f"Q_ocp(s): {data.num_peoples} × {CARGA_SENSIVEL_PESSOA_BTU} [BTU/h]",
                    formula=f"pessoas * {CARGA_SENSIVEL_PESSOA_BTU}",
                    inputs={"pessoas": data.num_peoples},
                    result=round(carga_pessoas_sensivel, 2),
                    unit="BTU/h",
                    norm_reference="ASHRAE Fundamentals 2021, Cap. 18, Tabela 1",
                ),
                CalculationStep(
                    step_name=f"Q_ocp(l): {data.num_peoples} × {CARGA_LATENTE_PESSOA_BTU} [BTU/h]",
                    formula=f"pessoas * {CARGA_LATENTE_PESSOA_BTU}",
                    inputs={"pessoas": data.num_peoples},
                    result=round(carga_pessoas_latente, 2),
                    unit="BTU/h",
                    norm_reference="ASHRAE Fundamentals 2021, Cap. 18, Tabela 1",
                ),
                CalculationStep(
                    step_name=f"Q_ilum: {data.area_m2}m² × 10W/m² × 3.41 [BTU/h]",
                    formula="area * 10 * 3.41214",
                    inputs={"area": data.area_m2},
                    result=round(carga_iluminacao, 2),
                    unit="BTU/h",
                    norm_reference="NBR 16401-1 §5.2, Tabela 2",
                ),
                CalculationStep(
                    step_name=f"Q_elec: {data.num_equipment} × {data.watts_per_equipment}W × 3.41 [BTU/h]",
                    formula="equip * watts * 3.41214",
                    inputs={"equip": data.num_equipment, "watts": data.watts_per_equipment},
                    result=round(carga_equipamentos, 2),
                    unit="BTU/h",
                    norm_reference="NBR 16401-1 §5.2.4",
                ),
                CalculationStep(
                    step_name="Subtotal [BTU/h]",
                    formula="Soma das cargas",
                    inputs={},
                    result=round(subtotal_btu, 2),
                    unit="BTU/h",
                    norm_reference="NBR 16401-1 §5",
                ),
                CalculationStep(
                    step_name="Fator de Segurança (+10%)",
                    formula="N/A",
                    inputs={},
                    result=f"× {FATOR_SEGURANCA}",
                    unit="adimensional",
                    norm_reference="NBR 16401-1 §5.5",
                ),
                CalculationStep(
                    step_name="TOTAL [BTU/h]",
                    formula="Subtotal * Fator Seguranca",
                    inputs={},
                    result=total_btu,
                    unit="BTU/h",
                    norm_reference="NBR 16401-1 §5",
                ),
            ]
        )

        # Determinação dos degraus comerciais padrão
        commercial_btu = total_btu
        if total_btu <= 9000:
            commercial_btu = 9000
            maquina = "1x Split 9.000 BTU/h"
        elif total_btu <= 12000:
            commercial_btu = 12000
            maquina = "1x Split 12.000 BTU/h"
        elif total_btu <= 18000:
            commercial_btu = 18000
            maquina = "1x Split 18.000 BTU/h"
        elif total_btu <= 24000:
            commercial_btu = 24000
            maquina = "1x Split 24.000 BTU/h"
        elif total_btu <= 30000:
            commercial_btu = 30000
            maquina = "1x Split 30.000 BTU/h"
        elif total_btu <= 36000:
            commercial_btu = 36000
            maquina = "1x Split Piso-Teto 36.000 BTU/h"
        elif total_btu <= 48000:
            commercial_btu = 48000
            maquina = "1x Cassete / Piso-Teto 48.000 BTU/h"
        elif total_btu <= 60000:
            commercial_btu = 60000
            maquina = f"1x Cassete / Piso-Teto 60.000 BTU/h (Carga: {total_btu:,.0f} BTU/h)"
        else:
            commercial_btu = 999999
            maquina = f"Sistema VRF ou múltiplos equipamentos (Carga total: {total_btu:,.0f} BTU/h)"

        options = get_dynamic_equipment(commercial_btu, total_btu)

        summary = {
            "total_btu": total_btu,
            "total_watts": round(total_btu * 0.293071, 2),
            "suggested_equipment": maquina,
            "recommended_options": [opt.dict() for opt in options]
        }

        metadata = {
            "constants_used": {
                "Carga Sensível por Pessoa": f"{CARGA_SENSIVEL_PESSOA_BTU} BTU/h",
                "Carga Latente por Pessoa": f"{CARGA_LATENTE_PESSOA_BTU} BTU/h",
                "Iluminação Média": f"{ILUMINACAO_W_POR_M2} W/m²",
                "Fator de Conversão Watt/BTU": FATOR_WATT_PARA_BTU,
                "Pé-Direito Base da Norma": f"{PE_DIREITO_REFERENCIA} m (Usado para correção volumétrica)",
                "Fator de Segurança (Cargas não previstas)": f"+{int((FATOR_SEGURANCA - 1) * 100)}%",
            },
            "references": [
                "ABNT NBR 16401-1: Instalações de ar-condicionado — Projeto",
                "ASHRAE Fundamentals 2021 — Capítulo 18 (Nonresidential Cooling and Heating Load Calculations)",
                "NIST SP 811: Guide for the Use of the International System of Units (SI) — Conversões",
            ],
        }

        return CalculationResult(steps=steps, summary=summary, warnings=warnings, metadata=metadata)

    def format_results(self, result: CalculationResult) -> ThermalOutput:
        step_by_step = {
            step.step_name: {
                "value": step.result,
                "formula": step.formula,
                "norm_reference": step.norm_reference
            }
            for step in result.steps
        }

        return ThermalOutput(
            total_btu_h=result.summary["total_btu"],
            total_watts=result.summary["total_watts"],
            suggested_equipment=result.summary["suggested_equipment"],
            recommended_options=result.summary.get("recommended_options", []),
            step_by_step=step_by_step,
            warnings=result.warnings,
            constants_used=result.metadata["constants_used"],
            references=result.metadata["references"],
        )


# ─── Endpoint ─────────────────────────────────────────────────────────────────


@router.post("/calculate_hvac", response_model=ThermalOutput)
async def calculate_hvac_load(data: ThermalInput, user=Depends(check_quota("run_simulation"))):
    """
    Cálculo de Carga Térmica de Conforto (AVAC/AC) — ABNT NBR 16401-1/2.
    """
    calculator = HvacCalculator()
    result = await calculator.calculate(data)
    return calculator.format_results(result)
