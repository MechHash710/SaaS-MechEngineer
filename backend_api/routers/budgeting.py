import math

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class BudgetItem(BaseModel):
    name: str
    quantity: float
    unit_price: float
    total: float


class BudgetResponse(BaseModel):
    project_id: str
    items: list[BudgetItem]
    total_cost: float


# ─── Tabela de Preços Estimados ──────────────────────────────────────────────
# Valores base de mercado (Brasil, 2024). Em produção, substituir por banco de dados.

PRECOS = {
    "tubo_cobre_metro": 45.00,  # Tubo de cobre 1/4 + 3/8 (metro linear)
    "suporte_condensadora": 60.00,  # Suporte metálico padrão
    "calco_borracha": 25.00,  # Calço anti-vibração (par)
    "disjuntor_20a": 35.00,  # Disjuntor bipolar 20A
    "disjuntor_30a": 50.00,  # Disjuntor bipolar 30A
    "disjuntor_40a": 65.00,  # Disjuntor tripolar 40A
    "dreno_pvc_metro": 12.00,  # Tubo PVC dreno 25mm (metro)
    "fita_isolante_rolo": 8.00,  # Fita isolante espuma
    "mao_obra_basica": 450.00,  # Até 12.000 BTU (1 técnico, 4h)
    "mao_obra_media": 750.00,  # 12-30k BTU (1 técnico, 6h)
    "mao_obra_pesada": 1200.00,  # 30k+ BTU (2 técnicos, 8h)
    "equipamento_split_9k": 1599.00,
    "equipamento_split_12k": 1899.00,
    "equipamento_split_18k": 2499.00,
    "equipamento_split_24k": 3199.00,
    "equipamento_split_30k": 4299.00,
    "equipamento_split_36k": 5499.00,
}


def _gerar_itens_por_btu(equipment_btu: float) -> list[BudgetItem]:
    """
    Gera lista de materiais e serviços proporcionais à capacidade térmica.
    Escalona tubo, mão de obra, proteção elétrica e acessórios.
    """
    items: list[BudgetItem] = []

    # ── 1. Equipamento (Split) ───────────────────────────────────────────────
    if equipment_btu <= 9000:
        items.append(
            BudgetItem(
                name="Split Hi-Wall Inverter 9.000 BTU/h",
                quantity=1,
                unit_price=PRECOS["equipamento_split_9k"],
                total=PRECOS["equipamento_split_9k"],
            )
        )
    elif equipment_btu <= 12000:
        items.append(
            BudgetItem(
                name="Split Hi-Wall Inverter 12.000 BTU/h",
                quantity=1,
                unit_price=PRECOS["equipamento_split_12k"],
                total=PRECOS["equipamento_split_12k"],
            )
        )
    elif equipment_btu <= 18000:
        items.append(
            BudgetItem(
                name="Split Hi-Wall Inverter 18.000 BTU/h",
                quantity=1,
                unit_price=PRECOS["equipamento_split_18k"],
                total=PRECOS["equipamento_split_18k"],
            )
        )
    elif equipment_btu <= 24000:
        items.append(
            BudgetItem(
                name="Split Hi-Wall Inverter 24.000 BTU/h",
                quantity=1,
                unit_price=PRECOS["equipamento_split_24k"],
                total=PRECOS["equipamento_split_24k"],
            )
        )
    elif equipment_btu <= 30000:
        items.append(
            BudgetItem(
                name="Split Piso-Teto 30.000 BTU/h",
                quantity=1,
                unit_price=PRECOS["equipamento_split_30k"],
                total=PRECOS["equipamento_split_30k"],
            )
        )
    elif equipment_btu <= 36000:
        items.append(
            BudgetItem(
                name="Split Piso-Teto 36.000 BTU/h",
                quantity=1,
                unit_price=PRECOS["equipamento_split_36k"],
                total=PRECOS["equipamento_split_36k"],
            )
        )
    else:
        # Múltiplas unidades
        num_unidades = math.ceil(equipment_btu / 36000)
        preco_total = num_unidades * PRECOS["equipamento_split_36k"]
        items.append(
            BudgetItem(
                name=f"Split Piso-Teto 36.000 BTU/h (×{num_unidades})",
                quantity=num_unidades,
                unit_price=PRECOS["equipamento_split_36k"],
                total=preco_total,
            )
        )

    # ── 2. Tubo de Cobre ─────────────────────────────────────────────────────
    # Regra: ~1 metro para cada 3.000 BTU, mínimo 3m
    metros_tubo = max(3.0, round(equipment_btu / 3000))
    items.append(
        BudgetItem(
            name='Tubo de Cobre 1/4" + 3/8" (par isolado)',
            quantity=metros_tubo,
            unit_price=PRECOS["tubo_cobre_metro"],
            total=round(metros_tubo * PRECOS["tubo_cobre_metro"], 2),
        )
    )

    # ── 3. Suporte da Condensadora ───────────────────────────────────────────
    items.append(
        BudgetItem(
            name="Suporte Metálico p/ Condensadora",
            quantity=1,
            unit_price=PRECOS["suporte_condensadora"],
            total=PRECOS["suporte_condensadora"],
        )
    )

    # ── 4. Calço Anti-Vibração ───────────────────────────────────────────────
    items.append(
        BudgetItem(
            name="Calço de Borracha Anti-Vibração (par)",
            quantity=1,
            unit_price=PRECOS["calco_borracha"],
            total=PRECOS["calco_borracha"],
        )
    )

    # ── 5. Proteção Elétrica ─────────────────────────────────────────────────
    if equipment_btu <= 12000:
        disj_nome, disj_preco = "Disjuntor Bipolar 20A", PRECOS["disjuntor_20a"]
    elif equipment_btu <= 24000:
        disj_nome, disj_preco = "Disjuntor Bipolar 30A", PRECOS["disjuntor_30a"]
    else:
        disj_nome, disj_preco = "Disjuntor Tripolar 40A", PRECOS["disjuntor_40a"]

    items.append(BudgetItem(name=disj_nome, quantity=1, unit_price=disj_preco, total=disj_preco))

    # ── 6. Dreno PVC ─────────────────────────────────────────────────────────
    metros_dreno = max(2.0, round(metros_tubo * 0.8))
    items.append(
        BudgetItem(
            name="Tubo PVC Dreno 25mm",
            quantity=metros_dreno,
            unit_price=PRECOS["dreno_pvc_metro"],
            total=round(metros_dreno * PRECOS["dreno_pvc_metro"], 2),
        )
    )

    # ── 7. Fita Isolante ─────────────────────────────────────────────────────
    rolos_fita = max(1, math.ceil(metros_tubo / 5))
    items.append(
        BudgetItem(
            name="Fita Isolante Espuma (rolo 10m)",
            quantity=rolos_fita,
            unit_price=PRECOS["fita_isolante_rolo"],
            total=round(rolos_fita * PRECOS["fita_isolante_rolo"], 2),
        )
    )

    # ── 8. Mão de Obra ───────────────────────────────────────────────────────
    if equipment_btu <= 12000:
        mo_preco = PRECOS["mao_obra_basica"]
        mo_desc = "Mão de Obra Instalação (1 técnico, ~4h)"
    elif equipment_btu <= 30000:
        mo_preco = PRECOS["mao_obra_media"]
        mo_desc = "Mão de Obra Instalação (1 técnico, ~6h)"
    else:
        mo_preco = PRECOS["mao_obra_pesada"]
        mo_desc = "Mão de Obra Instalação (2 técnicos, ~8h)"

    items.append(BudgetItem(name=mo_desc, quantity=1, unit_price=mo_preco, total=mo_preco))

    return items


@router.get("/generate/{project_id}", response_model=BudgetResponse)
def generate_budget(project_id: str, equipment_btu: float = 0):
    """
    Gera lista de materiais e custos de instalação PROPORCIONAL
    à capacidade térmica do equipamento dimensionado.
    """

    items = _gerar_itens_por_btu(equipment_btu)
    total_sum = sum(item.total for item in items)

    return BudgetResponse(project_id=project_id, items=items, total_cost=round(total_sum, 2))
