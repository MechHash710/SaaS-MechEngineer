"""
Generate a Kanban overview PDF for the Test Agent project.
Run: python generate_kanban_pdf.py
Output: kanban_overview.pdf
"""

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm, mm
from reportlab.platypus import (
    HRFlowable, Paragraph, SimpleDocTemplate, Spacer,
    Table, TableStyle, PageBreak,
)
from reportlab.lib.enums import TA_CENTER, TA_RIGHT
import datetime

# ─── Palette ─────────────────────────────────────────────────────────────────
NAVY     = colors.HexColor("#1B2A4A")
BLUE     = colors.HexColor("#2563EB")
SLATE    = colors.HexColor("#64748B")
LIGHT_BG = colors.HexColor("#F1F5F9")
BORDER   = colors.HexColor("#CBD5E1")
WHITE    = colors.white
GREEN    = colors.HexColor("#10AC84")
AMBER    = colors.HexColor("#F7B731")
RED      = colors.HexColor("#FC5C65")
ORANGE   = colors.HexColor("#E85D26")
PURPLE   = colors.HexColor("#8854D0")
CYAN     = colors.HexColor("#0EA5E9")
GRAY     = colors.HexColor("#4B6584")
LIME     = colors.HexColor("#22C55E")

STATUS_COLORS = {
    "Done":        colors.HexColor("#10AC84"),
    "In Progress": colors.HexColor("#F7B731"),
    "To Do":       colors.HexColor("#94A3B8"),
}

STATUS_BG = {
    "Done":        colors.HexColor("#ECFDF5"),
    "In Progress": colors.HexColor("#FFFBEB"),
    "To Do":       colors.HexColor("#F8FAFC"),
}

MILESTONE_COLORS = {
    "M1": colors.HexColor("#E85D26"),
    "M2": colors.HexColor("#2E86DE"),
    "M3": colors.HexColor("#10AC84"),
    "M4": colors.HexColor("#8854D0"),
    "M5": colors.HexColor("#F7B731"),
    "M6": colors.HexColor("#FC5C65"),
    "M7": colors.HexColor("#4B6584"),
    "M8": colors.HexColor("#22C55E"),
    "M9": colors.HexColor("#0EA5E9"),
}

# ─── Data ─────────────────────────────────────────────────────────────────────
MILESTONES = [
    {"id": "M1", "name": "Fundação & Arquitetura"},
    {"id": "M2", "name": "Motor de Cálculo"},
    {"id": "M3", "name": "Frontend & Interface"},
    {"id": "M4", "name": "Geração de Documentos"},
    {"id": "M5", "name": "Revisão Técnica"},
    {"id": "M6", "name": "SaaS & Monetização"},
    {"id": "M7", "name": "Testes & QA"},
    {"id": "M8", "name": "Deploy & Infraestrutura"},
    {"id": "M9", "name": "EnergyPlus Premium (BR)"},
]

TASKS = [
    # M1
    {"id":"T01","m":"M1","status":"Done","name":"Definir stack final","effort":"S","hours":4,"priority":"High"},
    {"id":"T02","m":"M1","status":"Done","name":"Configurar monorepo e ambiente de dev","effort":"M","hours":12,"priority":"High"},
    {"id":"T03","m":"M1","status":"Done","name":"Modelar banco de dados (PostgreSQL)","effort":"M","hours":16,"priority":"High"},
    {"id":"T04","m":"M1","status":"Done","name":"Implementar autenticação e autorização","effort":"L","hours":24,"priority":"High"},
    {"id":"T05","m":"M1","status":"Done","name":"Criar estrutura base da API (FastAPI)","effort":"M","hours":16,"priority":"High"},
    {"id":"T06","m":"M1","status":"Done","name":"Setup CI/CD pipeline","effort":"M","hours":12,"priority":"Medium"},
    # M2
    {"id":"T07","m":"M2","status":"Done","name":"Arquitetar engine de cálculo modular","effort":"L","hours":24,"priority":"High"},
    {"id":"T08","m":"M2","status":"Done","name":"Simulador 1: Carga Térmica (NBR 16401)","effort":"XL","hours":60,"priority":"High"},
    {"id":"T09","m":"M2","status":"Done","name":"Simulador 2: Aquecimento Solar (NBR 15569)","effort":"XL","hours":50,"priority":"High"},
    {"id":"T10","m":"M2","status":"Done","name":"Simulador 3: Ventilação (ASHRAE 62.1)","effort":"XL","hours":50,"priority":"Medium"},
    {"id":"T11","m":"M2","status":"Done","name":"Simulador 4: Eficiência Energética (INI-C)","effort":"XL","hours":60,"priority":"Medium"},
    {"id":"T12","m":"M2","status":"Done","name":"Simulador 5: HVAC Completo","effort":"XL","hours":80,"priority":"High"},
    {"id":"T13","m":"M2","status":"Done","name":"Testes unitários dos motores de cálculo","effort":"L","hours":30,"priority":"High"},
    # M3
    {"id":"T14","m":"M3","status":"Done","name":"Design system e componentes base","effort":"L","hours":30,"priority":"High"},
    {"id":"T15","m":"M3","status":"Done","name":"Telas de autenticação","effort":"L","hours":24,"priority":"Medium"},
    {"id":"T16","m":"M3","status":"Done","name":"Dashboard principal do engenheiro","effort":"L","hours":24,"priority":"High"},
    {"id":"T17","m":"M3","status":"Done","name":"Formulários dinâmicos dos simuladores","effort":"XL","hours":50,"priority":"High"},
    {"id":"T18","m":"M3","status":"Done","name":"Tela de resultados e visualização","effort":"L","hours":30,"priority":"High"},
    {"id":"T19","m":"M3","status":"Done","name":"Gestão de projetos do usuário","effort":"M","hours":16,"priority":"Medium"},
    # M4
    {"id":"T20","m":"M4","status":"Done","name":"Pipeline de geração de PDF","effort":"L","hours":30,"priority":"High"},
    {"id":"T21","m":"M4","status":"Done","name":"Template: Memorial de Cálculo","effort":"L","hours":20,"priority":"High"},
    {"id":"T22","m":"M4","status":"Done","name":"Template: Laudo Técnico","effort":"M","hours":16,"priority":"High"},
    {"id":"T23","m":"M4","status":"Done","name":"Template: Especificação de Equipamento","effort":"L","hours":24,"priority":"Medium"},
    {"id":"T24","m":"M4","status":"Done","name":"Template: Relatório Técnico Completo","effort":"L","hours":30,"priority":"High"},
    # M5
    {"id":"T25","m":"M5","status":"Done","name":"Motor de rastreabilidade de cálculos","effort":"L","hours":30,"priority":"High"},
    {"id":"T26","m":"M5","status":"Done","name":"Interface passo-a-passo de auditoria","effort":"L","hours":30,"priority":"High"},
    {"id":"T27","m":"M5","status":"Done","name":"Sistema de validação cruzada","effort":"L","hours":24,"priority":"Medium"},
    {"id":"T28","m":"M5","status":"Done","name":"Exportar trilha de auditoria no PDF","effort":"M","hours":16,"priority":"Medium"},
    # M6
    {"id":"T29","m":"M6","status":"Done","name":"Integrar gateway de pagamento (Stripe)","effort":"XL","hours":50,"priority":"High"},
    {"id":"T30","m":"M6","status":"Done","name":"Sistema de controle de acesso por plano","effort":"L","hours":24,"priority":"High"},
    {"id":"T31","m":"M6","status":"Done","name":"Dashboard admin (métricas e gestão)","effort":"L","hours":30,"priority":"Medium"},
    # M7
    {"id":"T32","m":"M7","status":"Done","name":"Landing page e onboarding","effort":"M","hours":16,"priority":"Low"},
    {"id":"T33","m":"M7","status":"In Progress","name":"Testes de integração end-to-end","effort":"L","hours":30,"priority":"High"},
    {"id":"T34","m":"M7","status":"Done","name":"Testes de carga e performance","effort":"L","hours":24,"priority":"High"},
    {"id":"T35","m":"M7","status":"Done","name":"Documentação técnica e de usuário","effort":"L","hours":30,"priority":"Medium"},
    {"id":"T37","m":"M7","status":"To Do","name":"Coleta estruturada de feedback beta","effort":"L","hours":30,"priority":"High"},
    {"id":"T67","m":"M7","status":"Done","name":"Fix: localStorage key mismatch","effort":"S","hours":3,"priority":"High"},
    {"id":"T68","m":"M7","status":"Done","name":"Expandir suite E2E: simulators + feedback","effort":"M","hours":10,"priority":"High"},
    {"id":"T69","m":"M7","status":"In Progress","name":"Estabilizar Vite build e flakiness E2E","effort":"M","hours":8,"priority":"High"},
    {"id":"T70","m":"M7","status":"Done","name":"Criar infraestrutura de agentes IA (.agent/)","effort":"L","hours":20,"priority":"Medium"},
    # M8
    {"id":"T54","m":"M8","status":"To Do","name":"Configurar Cloudflare para thermes.com.br","effort":"S","hours":2,"priority":"High"},
    {"id":"T55","m":"M8","status":"Done","name":"Preparar app para deploy cloud-native","effort":"M","hours":8,"priority":"High"},
    {"id":"T56","m":"M8","status":"Done","name":"Abstrair configuração de infraestrutura","effort":"M","hours":6,"priority":"High"},
    {"id":"T57","m":"M8","status":"To Do","name":"Deploy backend FastAPI no Railway","effort":"M","hours":4,"priority":"High"},
    {"id":"T58","m":"M8","status":"To Do","name":"Deploy frontend React no Railway/Vercel","effort":"S","hours":3,"priority":"High"},
    {"id":"T59","m":"M8","status":"To Do","name":"Configurar storage para PDFs (R2/S3)","effort":"M","hours":6,"priority":"High"},
    {"id":"T60","m":"M8","status":"To Do","name":"Configurar monitoramento básico (Sentry)","effort":"S","hours":4,"priority":"Medium"},
    {"id":"T61","m":"M8","status":"To Do","name":"Configurar backup automático PostgreSQL","effort":"S","hours":3,"priority":"Medium"},
    {"id":"T62","m":"M8","status":"To Do","name":"Configurar CI/CD para deploy automático","effort":"M","hours":6,"priority":"High"},
    {"id":"T63","m":"M8","status":"To Do","name":"Soft launch thermes.com.br","effort":"M","hours":8,"priority":"High"},
    {"id":"T64","m":"M8","status":"To Do","name":"Adicionar Redis para cache e sessões","effort":"M","hours":6,"priority":"Medium"},
    {"id":"T65","m":"M8","status":"To Do","name":"Documentar migração de plataforma","effort":"L","hours":12,"priority":"Medium"},
    {"id":"T66","m":"M8","status":"To Do","name":"Implementar rate limiting e proteção API","effort":"M","hours":8,"priority":"Medium"},
    # M9
    {"id":"T38","m":"M9","status":"To Do","name":"Fork EnergyPlus + Docker container","effort":"L","hours":20,"priority":"High"},
    {"id":"T39","m":"M9","status":"To Do","name":"Camada de abstração Python (engine interface)","effort":"L","hours":24,"priority":"High"},
    {"id":"T40","m":"M9","status":"To Do","name":"Biblioteca de materiais construtivos BR","effort":"XL","hours":40,"priority":"High"},
    {"id":"T41","m":"M9","status":"To Do","name":"Gerenciador de arquivos EPW brasileiros","effort":"L","hours":24,"priority":"High"},
    {"id":"T42","m":"M9","status":"To Do","name":"Gerador automático de arquivos IDF","effort":"XL","hours":50,"priority":"High"},
    {"id":"T43","m":"M9","status":"To Do","name":"Schedules de uso brasileiros por tipologia","effort":"M","hours":16,"priority":"Medium"},
    {"id":"T44","m":"M9","status":"To Do","name":"Parser de outputs EnergyPlus → estruturado","effort":"L","hours":24,"priority":"High"},
    {"id":"T45","m":"M9","status":"To Do","name":"Lógica de verificação NBR 15575:2021","effort":"XL","hours":40,"priority":"High"},
    {"id":"T46","m":"M9","status":"To Do","name":"Gerador de edifício de referência","effort":"L","hours":30,"priority":"High"},
    {"id":"T47","m":"M9","status":"To Do","name":"Template Laudo Térmico NBR 15575 (PDF)","effort":"L","hours":24,"priority":"High"},
    {"id":"T48","m":"M9","status":"To Do","name":"Integração Zone/System Sizing com ART","effort":"L","hours":30,"priority":"High"},
    {"id":"T49","m":"M9","status":"To Do","name":"Templates HVAC brasileiros (HVACTemplate)","effort":"L","hours":30,"priority":"High"},
    {"id":"T50","m":"M9","status":"To Do","name":"Memorial de cálculo por simulação (PDF ART)","effort":"L","hours":24,"priority":"High"},
    {"id":"T51","m":"M9","status":"To Do","name":"Implementar regras INI-C (edifício referência)","effort":"XL","hours":60,"priority":"Medium"},
    {"id":"T52","m":"M9","status":"To Do","name":"Comparativo real vs. referência + ENCE","effort":"XL","hours":50,"priority":"Medium"},
    {"id":"T53","m":"M9","status":"To Do","name":"Frontend Premium: wizard + visualização 3D","effort":"XL","hours":60,"priority":"High"},
]


def compute_stats():
    total = len(TASKS)
    done = sum(1 for t in TASKS if t["status"] == "Done")
    in_prog = sum(1 for t in TASKS if t["status"] == "In Progress")
    todo = total - done - in_prog
    total_h = sum(t["hours"] for t in TASKS)
    done_h = sum(t["hours"] for t in TASKS if t["status"] == "Done")
    pct = round(done / total * 100)
    return total, done, in_prog, todo, total_h, done_h, pct


def milestone_stats(mid):
    tasks = [t for t in TASKS if t["m"] == mid]
    total = len(tasks)
    done = sum(1 for t in tasks if t["status"] == "Done")
    in_prog = sum(1 for t in tasks if t["status"] == "In Progress")
    todo = total - done - in_prog
    hours = sum(t["hours"] for t in tasks)
    done_h = sum(t["hours"] for t in tasks if t["status"] == "Done")
    pct = round(done / total * 100) if total else 0
    return total, done, in_prog, todo, hours, done_h, pct


# ─── Progress bar helper ──────────────────────────────────────────────────────
def progress_bar_table(pct, color, width=10*cm):
    bar_data = [[""]]
    bar = Table(bar_data, colWidths=[width * pct / 100], rowHeights=[6*mm])
    bar.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), color),
        ("BOX", (0, 0), (-1, -1), 0, WHITE),
    ]))
    bg = Table([[bar]], colWidths=[width], rowHeights=[6*mm])
    bg.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#E2E8F0")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    return bg


# ─── Page callbacks ───────────────────────────────────────────────────────────
def add_header_footer(canvas, doc):
    canvas.saveState()
    w, h = A4

    # Header bar
    canvas.setFillColor(NAVY)
    canvas.rect(0, h - 1.2*cm, w, 1.2*cm, fill=1, stroke=0)
    canvas.setFillColor(WHITE)
    canvas.setFont("Helvetica-Bold", 9)
    canvas.drawString(1.5*cm, h - 0.85*cm, "EngenhariaPro — Kanban Overview")
    canvas.setFont("Helvetica", 8)
    canvas.drawRightString(w - 1.5*cm, h - 0.85*cm, f"Gerado em {datetime.date.today().strftime('%d/%m/%Y')}")

    # Footer
    canvas.setFillColor(SLATE)
    canvas.setFont("Helvetica", 7.5)
    canvas.drawString(1.5*cm, 0.7*cm, "Documento gerado automaticamente — uso interno")
    canvas.drawRightString(w - 1.5*cm, 0.7*cm, f"Página {doc.page}")
    canvas.setStrokeColor(BORDER)
    canvas.line(1.5*cm, 1.1*cm, w - 1.5*cm, 1.1*cm)

    canvas.restoreState()


# ─── Build ────────────────────────────────────────────────────────────────────
def build():
    output = "kanban_overview.pdf"
    doc = SimpleDocTemplate(
        output,
        pagesize=A4,
        rightMargin=1.5*cm,
        leftMargin=1.5*cm,
        topMargin=2*cm,
        bottomMargin=1.8*cm,
        title="EngenhariaPro — Kanban Overview",
    )

    story = []

    h1 = ParagraphStyle("h1", fontName="Helvetica-Bold", fontSize=20, textColor=NAVY,
                         spaceAfter=4, leading=24)
    h2 = ParagraphStyle("h2", fontName="Helvetica-Bold", fontSize=13, textColor=NAVY,
                         spaceAfter=3, leading=16)
    normal = ParagraphStyle("normal", fontName="Helvetica", fontSize=9, textColor=SLATE,
                             leading=13)

    # ── Cover / title ──────────────────────────────────────────────────────────
    story.append(Spacer(1, 0.5*cm))
    story.append(Paragraph("KANBAN — VISÃO GERAL DO PROJETO", h1))
    story.append(Paragraph("EngenhariaPro · Plataforma de Cálculo de Engenharia Mecânica", normal))
    story.append(HRFlowable(width="100%", thickness=2, color=NAVY, spaceAfter=12))

    # ── Global stats ───────────────────────────────────────────────────────────
    total, done, in_prog, todo, total_h, done_h, pct = compute_stats()

    stat_data = [
        [
            Paragraph(f"<b>{total}</b>", ParagraphStyle("sv", fontName="Helvetica-Bold", fontSize=22, textColor=NAVY, alignment=TA_CENTER)),
            Paragraph(f"<b>{done}</b>", ParagraphStyle("sv", fontName="Helvetica-Bold", fontSize=22, textColor=STATUS_COLORS["Done"], alignment=TA_CENTER)),
            Paragraph(f"<b>{in_prog}</b>", ParagraphStyle("sv", fontName="Helvetica-Bold", fontSize=22, textColor=STATUS_COLORS["In Progress"], alignment=TA_CENTER)),
            Paragraph(f"<b>{todo}</b>", ParagraphStyle("sv", fontName="Helvetica-Bold", fontSize=22, textColor=SLATE, alignment=TA_CENTER)),
            Paragraph(f"<b>{pct}%</b>", ParagraphStyle("sv", fontName="Helvetica-Bold", fontSize=22, textColor=BLUE, alignment=TA_CENTER)),
            Paragraph(f"<b>{total_h}h</b>", ParagraphStyle("sv", fontName="Helvetica-Bold", fontSize=22, textColor=NAVY, alignment=TA_CENTER)),
        ],
        [
            Paragraph("Total", ParagraphStyle("sl", fontName="Helvetica", fontSize=8, textColor=SLATE, alignment=TA_CENTER)),
            Paragraph("Concluídas", ParagraphStyle("sl", fontName="Helvetica", fontSize=8, textColor=SLATE, alignment=TA_CENTER)),
            Paragraph("Em andamento", ParagraphStyle("sl", fontName="Helvetica", fontSize=8, textColor=SLATE, alignment=TA_CENTER)),
            Paragraph("A fazer", ParagraphStyle("sl", fontName="Helvetica", fontSize=8, textColor=SLATE, alignment=TA_CENTER)),
            Paragraph("Conclusão", ParagraphStyle("sl", fontName="Helvetica", fontSize=8, textColor=SLATE, alignment=TA_CENTER)),
            Paragraph("Horas totais", ParagraphStyle("sl", fontName="Helvetica", fontSize=8, textColor=SLATE, alignment=TA_CENTER)),
        ],
    ]
    col_w = (doc.width) / 6
    stat_tbl = Table(stat_data, colWidths=[col_w]*6, rowHeights=[1.1*cm, 0.5*cm])
    stat_tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), LIGHT_BG),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("BOX", (0, 0), (-1, -1), 0.5, BORDER),
        ("LINEAFTER", (0, 0), (4, -1), 0.5, BORDER),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(stat_tbl)
    story.append(Spacer(1, 0.3*cm))

    # Global progress bar
    bar_pct_w = doc.width * pct / 100
    bar_data = [[""]]
    bar_filled = Table(bar_data, colWidths=[bar_pct_w], rowHeights=[8*mm])
    bar_filled.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), BLUE),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    bar_bg = Table([[bar_filled]], colWidths=[doc.width], rowHeights=[8*mm])
    bar_bg.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#E2E8F0")),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    story.append(bar_bg)
    story.append(Paragraph(
        f"Progresso global: {done_h}h concluídas de {total_h}h totais ({pct}%)",
        ParagraphStyle("pb", fontName="Helvetica", fontSize=8, textColor=SLATE, spaceAfter=12)
    ))

    # ── Milestone summary table ────────────────────────────────────────────────
    story.append(Paragraph("Resumo por Milestone", h2))
    story.append(HRFlowable(width="100%", thickness=1, color=BORDER, spaceAfter=6))

    hdr_style = ParagraphStyle("th", fontName="Helvetica-Bold", fontSize=8, textColor=WHITE, alignment=TA_CENTER)
    ms_hdr = [
        Paragraph("Milestone", hdr_style),
        Paragraph("Tarefas", hdr_style),
        Paragraph("Done", hdr_style),
        Paragraph("WIP", hdr_style),
        Paragraph("To Do", hdr_style),
        Paragraph("Horas", hdr_style),
        Paragraph("%", hdr_style),
        Paragraph("Status", hdr_style),
    ]
    ms_rows = [ms_hdr]

    for ms in MILESTONES:
        mid = ms["id"]
        t, d, ip, td, h, dh, p = milestone_stats(mid)
        mc = MILESTONE_COLORS[mid]

        if p == 100:
            status_txt = "Concluído"
            status_c = STATUS_COLORS["Done"]
        elif ip > 0 or d > 0:
            status_txt = "Em andamento"
            status_c = STATUS_COLORS["In Progress"]
        else:
            status_txt = "Não iniciado"
            status_c = SLATE

        cell_s = ParagraphStyle("cs", fontName="Helvetica", fontSize=8, textColor=colors.HexColor("#1E293B"))
        cell_c = ParagraphStyle("cc", fontName="Helvetica", fontSize=8, textColor=colors.HexColor("#1E293B"), alignment=TA_CENTER)

        ms_rows.append([
            Paragraph(f"<b>{mid}</b> — {ms['name']}", cell_s),
            Paragraph(str(t), cell_c),
            Paragraph(str(d), ParagraphStyle("cd", fontName="Helvetica-Bold", fontSize=8, textColor=STATUS_COLORS["Done"], alignment=TA_CENTER)),
            Paragraph(str(ip), ParagraphStyle("ci", fontName="Helvetica-Bold", fontSize=8, textColor=STATUS_COLORS["In Progress"], alignment=TA_CENTER)),
            Paragraph(str(td), cell_c),
            Paragraph(f"{h}h", cell_c),
            Paragraph(f"{p}%", ParagraphStyle("cp", fontName="Helvetica-Bold", fontSize=8, textColor=mc, alignment=TA_CENTER)),
            Paragraph(status_txt, ParagraphStyle("cst", fontName="Helvetica-Bold", fontSize=7.5, textColor=status_c, alignment=TA_CENTER)),
        ])

    col_widths = [6*cm, 1.1*cm, 1.1*cm, 0.9*cm, 1.1*cm, 1.3*cm, 1.1*cm, 2.2*cm]
    ms_tbl = Table(ms_rows, colWidths=col_widths, repeatRows=1)
    ms_tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("ALIGN", (0, 0), (-1, 0), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        *[("BACKGROUND", (0, i), (-1, i), LIGHT_BG) for i in range(2, len(ms_rows), 2)],
        ("GRID", (0, 0), (-1, -1), 0.4, BORDER),
    ]))
    for i, ms_item in enumerate(MILESTONES, start=1):
        mc = MILESTONE_COLORS[ms_item["id"]]
        ms_tbl.setStyle(TableStyle([
            ("LINEBEFORE", (0, i), (0, i), 4, mc),
        ]))

    story.append(ms_tbl)
    story.append(Spacer(1, 0.4*cm))

    # ── Per-milestone task detail ─────────────────────────────────────────────
    story.append(PageBreak())
    story.append(Paragraph("Detalhe das Tarefas por Milestone", h2))
    story.append(HRFlowable(width="100%", thickness=1, color=BORDER, spaceAfter=10))

    for ms in MILESTONES:
        mid = ms["id"]
        mc = MILESTONE_COLORS[mid]
        ms_tasks = [t for t in TASKS if t["m"] == mid]
        _, d, ip, td, h, dh, p = milestone_stats(mid)

        # Milestone header band
        hdr_data = [[
            Paragraph(f"{mid} — {ms['name']}", ParagraphStyle("mh", fontName="Helvetica-Bold", fontSize=10, textColor=WHITE)),
            Paragraph(f"{d}/{len(ms_tasks)} tarefas  ·  {dh}/{h}h  ·  {p}%",
                      ParagraphStyle("mhs", fontName="Helvetica", fontSize=8.5, textColor=WHITE, alignment=TA_RIGHT)),
        ]]
        hdr_tbl = Table(hdr_data, colWidths=[doc.width * 0.6, doc.width * 0.4], rowHeights=[0.7*cm])
        hdr_tbl.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), mc),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]))
        story.append(hdr_tbl)

        # Task rows header
        t_hdr_s = ParagraphStyle("th2", fontName="Helvetica-Bold", fontSize=7.5, textColor=SLATE)
        t_hdr = [
            Paragraph("ID", t_hdr_s),
            Paragraph("Tarefa", t_hdr_s),
            Paragraph("Esforço", t_hdr_s),
            Paragraph("Horas", t_hdr_s),
            Paragraph("Prioridade", t_hdr_s),
            Paragraph("Status", t_hdr_s),
        ]
        task_rows = [t_hdr]

        for t in ms_tasks:
            sc = STATUS_COLORS[t["status"]]
            pc_map = {"High": RED, "Medium": AMBER, "Low": GREEN}
            pc = pc_map.get(t["priority"], SLATE)
            ts = ParagraphStyle("ts", fontName="Helvetica", fontSize=8, textColor=colors.HexColor("#1E293B"), leading=10)
            tc = ParagraphStyle("tc", fontName="Helvetica", fontSize=8, textColor=colors.HexColor("#1E293B"), alignment=TA_CENTER, leading=10)
            task_rows.append([
                Paragraph(f"<b>{t['id']}</b>", ParagraphStyle("tid", fontName="Helvetica-Bold", fontSize=7.5, textColor=mc, alignment=TA_CENTER)),
                Paragraph(t["name"], ts),
                Paragraph(t["effort"], tc),
                Paragraph(f"{t['hours']}h", tc),
                Paragraph(t["priority"], ParagraphStyle("tp", fontName="Helvetica-Bold", fontSize=7.5, textColor=pc, alignment=TA_CENTER)),
                Paragraph(t["status"], ParagraphStyle("tst", fontName="Helvetica-Bold", fontSize=7.5, textColor=sc, alignment=TA_CENTER)),
            ])

        t_widths = [1*cm, 7.5*cm, 1.2*cm, 1.2*cm, 1.5*cm, 2.3*cm]
        t_tbl = Table(task_rows, colWidths=t_widths, repeatRows=1)
        t_tbl.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), LIGHT_BG),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 5),
            ("RIGHTPADDING", (0, 0), (-1, -1), 5),
            *[("BACKGROUND", (0, i), (-1, i), LIGHT_BG) for i in range(2, len(task_rows), 2)],
            ("GRID", (0, 0), (-1, -1), 0.3, BORDER),
            # Color left stripe per status
            *[("LINEBEFORE", (0, i), (0, i), 3, STATUS_COLORS.get(ms_tasks[i-1]["status"], SLATE))
              for i in range(1, len(task_rows))],
        ]))
        story.append(t_tbl)
        story.append(Spacer(1, 0.4*cm))

    # ── Legend ────────────────────────────────────────────────────────────────
    story.append(HRFlowable(width="100%", thickness=1, color=BORDER, spaceAfter=6))
    legend_s = ParagraphStyle("leg", fontName="Helvetica", fontSize=8, textColor=SLATE)
    story.append(Paragraph(
        "<b>Legenda de Esforço:</b>  XS = &lt;4h  ·  S = 4–8h  ·  M = 8–16h  ·  L = 16–32h  ·  XL = &gt;32h    "
        "<b>Prioridade:</b>  High = crítico  ·  Medium = importante  ·  Low = desejável",
        legend_s
    ))

    doc.build(story, onFirstPage=add_header_footer, onLaterPages=add_header_footer)
    print(f"PDF gerado: {output}")


if __name__ == "__main__":
    build()
