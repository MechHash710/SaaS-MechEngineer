import os

from fastapi import APIRouter, Depends
from fastapi.responses import Response
from pydantic import BaseModel

from core.quota import check_quota
from services.pdf_service import PDFGenerator

router = APIRouter()
pdf_service = PDFGenerator(templates_dir=os.path.join(os.path.dirname(__file__), "..", "templates"))


class DocumentRequest(BaseModel):
    project_id: str
    engineer_crea: str
    equipment_btu: float
    localizacao: str | None = None
    step_by_step: dict | None = None
    constants_used: dict | None = None
    references: list[str] | None = None
    cliente_nome: str | None = "Cliente Padrão"


class BudgetItemModel(BaseModel):
    name: str
    quantity: int
    unit_price: float
    total: float


class SpecRequest(BaseModel):
    project_id: str
    equipment_spec: str
    application: str
    items: list[BudgetItemModel]
    total_cost: float


class RelatorioCompletoRequest(BaseModel):
    project_id: str
    project_name: str
    engineer_name: str
    engineer_crea: str
    location: str
    module_title: str
    inputs: dict
    steps: list
    result_summary: dict
    recommended_equipment: str


@router.post("/generate_art_data")
def generate_art_data(request: DocumentRequest):
    """
    Compila os dados do dimensionamento, cálculo e orçamento para
    preenchimento automático da ART no portal do CREA.

    Inclui:
    - Dados de atividade e tipo de obra
    - Descrição técnica com capacidade e localização
    - Normas aplicadas com seções relevantes
    - Resumo do memorial de cálculo (quando fornecido)
    """

    # Descrição complementar com dados do dimensionamento
    descricao = (
        f"Projeto e dimensionamento térmico para capacidade de "
        f"{request.equipment_btu:,.0f} BTU/h".replace(",", ".")
    )
    if request.localizacao:
        descricao += f", localizado em {request.localizacao}"
    descricao += f". (Projeto {request.project_id})"

    # Normas com seções específicas
    normas = [
        "NBR 16401-1 (Instalações de ar-condicionado — Projeto)",
        "NBR 16401-2 (Parâmetros de conforto térmico)",
        "NBR 16401-3 (Qualidade do ar interior)",
        "ASHRAE Fundamentals 2021 — Cap. 18 (Cargas Térmicas)",
    ]

    response_data: dict = {
        "atividade": "Elaboração de Projeto e Execução de Instalação",
        "tipo_obra": "Sistemas de Climatização (Ar Condicionado)",
        "descricao_complementar": descricao,
        "crea_responsavel": request.engineer_crea,
        "normas_aplicadas": normas,
    }

    # Incluir resumo da memória de cálculo se fornecido
    if request.step_by_step:
        response_data["memorial_calculo"] = request.step_by_step

    return {"status": "success", "data": response_data}


@router.post("/memorial/{tipo}")
def generate_memorial(
    tipo: str, request: DocumentRequest, user=Depends(check_quota("generate_pdf_memorial"))
):
    data = {
        "title": f"Memorial de Cálculo - {'Climatização' if tipo == 'hvac' else 'Aquecimento Solar'}",
        "projeto": request.project_id,
        "company": "Engenharia & Projetos Termodinâmicos",
        "norma_referencia": "NBR 16401" if tipo == "hvac" else "NBR 15569",
        "engineer_crea": request.engineer_crea,
        "equipment_btu": request.equipment_btu,
        "localizacao": request.localizacao,
        "step_by_step": request.step_by_step,
        "constants_used": request.constants_used,
        "references": request.references,
        "doc_number": f"MEM-{request.project_id}",
    }

    pdf_result = pdf_service.generate("memorial_calculo.html", data, output_filename=f"memorial_{tipo}_{request.project_id}.pdf")

    if isinstance(pdf_result, str):
        from fastapi.responses import RedirectResponse
        return RedirectResponse(url=pdf_result, status_code=303)

    return Response(
        content=pdf_result,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=memorial_{tipo}_{request.project_id}.pdf"
        },
    )


@router.post("/especificacao")
def generate_especificacao(
    request: SpecRequest, user=Depends(check_quota("generate_pdf_especificacao"))
):
    data = {
        "title": "Especificação de Equipamentos e Orçamento",
        "projeto": request.project_id,
        "company": "Engenharia & Projetos Termodinâmicos",
        "norma_referencia": "Estimativa Básica Parametrizada",
        "equipment_spec": request.equipment_spec,
        "application": request.application,
        "items": [item.dict() for item in request.items],
        "total_cost": request.total_cost,
        "doc_number": f"SPEC-{request.project_id}",
    }

    pdf_result = pdf_service.generate("especificacao_equipamento.html", data, output_filename=f"especificacao_{request.project_id}.pdf")

    if isinstance(pdf_result, str):
        from fastapi.responses import RedirectResponse
        return RedirectResponse(url=pdf_result, status_code=303)

    return Response(
        content=pdf_result,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=especificacao_{request.project_id}.pdf"
        },
    )


@router.post("/laudo/{tipo}")
def generate_laudo(
    tipo: str, request: DocumentRequest, user=Depends(check_quota("generate_pdf_laudo"))
):
    data = {
        "title": f"Laudo Técnico de Engenharia - {'Climatização' if tipo == 'hvac' else 'Aquecimento Solar'}",
        "projeto": request.project_id,
        "company": "Engenharia & Projetos Termodinâmicos",
        "norma_referencia": "NBR 16401" if tipo == "hvac" else "NBR 15569",
        "engineer_crea": request.engineer_crea,
        "cliente_nome": request.cliente_nome,
        "localizacao": request.localizacao,
        "sistema_tipo": "Acondicionamento de Ar (HVAC)"
        if tipo == "hvac"
        else "Sistema de Aquecimento de Água por Energia Solar",
        "equipment_btu": request.equipment_btu,
        "referencias": request.references,
        "doc_number": f"LAUDO-{request.project_id}",
    }

    pdf_result = pdf_service.generate("laudo_tecnico.html", data, output_filename=f"laudo_{tipo}_{request.project_id}.pdf")

    if isinstance(pdf_result, str):
        from fastapi.responses import RedirectResponse
        return RedirectResponse(url=pdf_result, status_code=303)

    return Response(
        content=pdf_result,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=laudo_{tipo}_{request.project_id}.pdf"
        },
    )


@router.post("/relatorio_completo")
def generate_relatorio_completo(
    request: RelatorioCompletoRequest, user=Depends(check_quota("generate_pdf_relatorio_completo"))
):
    import datetime

    data = request.model_dump()
    data["current_date"] = datetime.datetime.now().strftime("%d/%m/%Y")

    pdf_result = pdf_service.generate("relatorio_completo.html", data, output_filename=f"relatorio_completo_{request.project_id}.pdf")

    if isinstance(pdf_result, str):
        from fastapi.responses import RedirectResponse
        return RedirectResponse(url=pdf_result, status_code=303)

    return Response(
        content=pdf_result,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=relatorio_completo_{request.project_id}.pdf"
        },
    )
