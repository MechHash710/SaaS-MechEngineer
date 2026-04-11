import datetime
import re
from io import BytesIO

from jinja2 import Environment, FileSystemLoader
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm, mm
from reportlab.platypus import (
    HRFlowable,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


# ─── Palette ─────────────────────────────────────────────────────────────────
NAVY     = colors.HexColor("#1B2A4A")
BLUE     = colors.HexColor("#2563EB")
SLATE    = colors.HexColor("#64748B")
LIGHT_BG = colors.HexColor("#F1F5F9")
BORDER   = colors.HexColor("#CBD5E1")
WHITE    = colors.white
AMBER    = colors.HexColor("#F59E0B")
GREEN    = colors.HexColor("#10B981")


def _strip_html(raw_html: str) -> str:
    """Remove <style>, <script> blocks and all HTML tags; decode common entities."""
    # Remove entire <style>...</style> and <script>...</script> blocks first
    cleaned = re.sub(r"<style[^>]*>.*?</style>", "", raw_html, flags=re.DOTALL | re.IGNORECASE)
    cleaned = re.sub(r"<script[^>]*>.*?</script>", "", cleaned, flags=re.DOTALL | re.IGNORECASE)
    # Strip remaining tags
    cleaned = re.sub(r"<[^>]+>", "", cleaned)
    # Decode HTML entities
    cleaned = cleaned.replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">").replace("&nbsp;", " ")
    return cleaned


class PDFGenerator:
    def __init__(self, templates_dir: str):
        self.env = Environment(loader=FileSystemLoader(templates_dir))

    def generate(self, template_name: str, data: dict, output_filename: str = None):
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=2 * cm,
            leftMargin=2 * cm,
            topMargin=3 * cm,
            bottomMargin=2.5 * cm,
            title=data.get("title", "Documento de Engenharia"),
        )

        styles = getSampleStyleSheet()
        story = self._build_story(data, styles)

        doc.build(story, onFirstPage=self._header_footer(data), onLaterPages=self._header_footer(data))

        pdf_bytes = buffer.getvalue()
        buffer.close()

        from core.config import settings
        
        if settings.R2_ACCOUNT_ID and settings.R2_ACCESS_KEY_ID:
            import boto3
            import uuid
            from botocore.config import Config
            
            s3_client = boto3.client(
                "s3",
                endpoint_url=f"https://{settings.R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
                aws_access_key_id=settings.R2_ACCESS_KEY_ID,
                aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
                config=Config(signature_version="s3v4")
            )

            file_key = f"pdfs/{uuid.uuid4().hex}_{output_filename if output_filename else 'documentator.pdf'}"

            # Upload with content passing
            s3_client.put_object(
                Bucket=settings.R2_BUCKET_NAME,
                Key=file_key,
                Body=pdf_bytes,
                ContentType="application/pdf"
            )

            # Presigned URL (1 hour)
            url = s3_client.generate_presigned_url(
                "get_object",
                Params={"Bucket": settings.R2_BUCKET_NAME, "Key": file_key},
                ExpiresIn=3600
            )
            return url

        return pdf_bytes

    # ── Page decoration ───────────────────────────────────────────────────────
    def _header_footer(self, data):
        title = data.get("title", "Memorial Técnico")
        company = data.get("company", "Engenharia & Projetos Termodinâmicos")
        norma = data.get("norma_referencia", "ABNT/ASHRAE")
        doc_num = data.get("doc_number", "—")

        def draw(canvas, doc):
            canvas.saveState()
            w, h = A4

            # Header bar
            canvas.setFillColor(NAVY)
            canvas.rect(0, h - 2 * cm, w, 2 * cm, fill=1, stroke=0)
            canvas.setFillColor(WHITE)
            canvas.setFont("Helvetica-Bold", 11)
            canvas.drawString(2 * cm, h - 1.2 * cm, title)
            canvas.setFont("Helvetica", 8)
            canvas.drawRightString(w - 2 * cm, h - 1.15 * cm, company)
            canvas.drawRightString(w - 2 * cm, h - 1.55 * cm,
                f"Nº {doc_num}  |  {datetime.date.today().strftime('%d/%m/%Y')}")

            # Footer
            canvas.setStrokeColor(BORDER)
            canvas.line(2 * cm, 1.8 * cm, w - 2 * cm, 1.8 * cm)
            canvas.setFillColor(SLATE)
            canvas.setFont("Helvetica", 7)
            canvas.drawString(2 * cm, 1.2 * cm, f"Ref. Normativa: {norma}")
            canvas.drawRightString(w - 2 * cm, 1.2 * cm, f"Página {doc.page}")
            canvas.restoreState()

        return draw

    # ── Story builder ─────────────────────────────────────────────────────────
    def _build_story(self, data: dict, base_styles) -> list:
        story = []

        h2 = ParagraphStyle("H2", fontSize=11, textColor=NAVY, fontName="Helvetica-Bold",
                             spaceAfter=4 * mm, spaceBefore=6 * mm,
                             borderPadding=(0, 0, 2, 0))
        body = ParagraphStyle("Body", fontSize=9, textColor=colors.HexColor("#334155"),
                               leading=14, spaceAfter=3 * mm)
        mono = ParagraphStyle("Mono", fontSize=8, fontName="Courier", textColor=SLATE, leading=12)
        label = ParagraphStyle("Label", fontSize=7, textColor=SLATE, fontName="Helvetica-Bold",
                                leading=10, spaceAfter=1 * mm)

        # ── 1. Identification table ──────────────────────────────────────────
        story.append(Paragraph("1. Responsabilidade Técnica", h2))
        id_data = [
            ["Engenheiro / CREA", data.get("engineer_crea", "—")],
            ["Norma Aplicável", data.get("norma_referencia", "—")],
            ["Localização", data.get("localizacao", "—")],
            ["Projeto", data.get("projeto", "—")],
        ]
        id_table = Table(id_data, colWidths=[5 * cm, None])
        id_table.setStyle(TableStyle([
            ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("BACKGROUND", (0, 0), (0, -1), LIGHT_BG),
            ("TEXTCOLOR", (0, 0), (0, -1), NAVY),
            ("GRID", (0, 0), (-1, -1), 0.4, BORDER),
            ("ROWBACKGROUNDS", (0, 0), (-1, -1), [WHITE, LIGHT_BG]),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ]))
        story.append(id_table)
        story.append(Spacer(1, 4 * mm))

        # ── 2. Main result block ─────────────────────────────────────────────
        story.append(Paragraph("2. Resultado Principal", h2))
        result_val = str(data.get("equipment_btu", "—"))
        result_block = Table(
            [[Paragraph("DIMENSIONAMENTO PRINCIPAL", label),
              Paragraph(result_val, ParagraphStyle("Big", fontSize=18, fontName="Helvetica-Bold",
                                                    textColor=BLUE))]],
            colWidths=[6 * cm, None]
        )
        result_block.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#EFF6FF")),
            ("BOX", (0, 0), (-1, -1), 1.2, BLUE),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ("RIGHTPADDING", (0, 0), (-1, -1), 10),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]))
        story.append(result_block)
        story.append(Spacer(1, 4 * mm))

        # ── 3. Step-by-step memory ───────────────────────────────────────────
        step_by_step = data.get("step_by_step")
        if step_by_step:
            story.append(Paragraph("3. Memória de Cálculo Detalhada", h2))
            story.append(Paragraph(
                "Sequência lógica de equações com referências normativas para auditoria e emissão de ART.",
                body))

            rows = [["Etapa", "Equação", "Resultado", "Norma"]]
            for name, info in step_by_step.items():
                if isinstance(info, dict):
                    val = str(info.get("value", "—"))
                    formula = str(info.get("formula", "—"))
                    norm = str(info.get("norm_reference", "—"))
                else:
                    val = str(info)
                    formula = "—"
                    norm = "—"
                rows.append([
                    Paragraph(name, ParagraphStyle("StepLabel", fontSize=8, fontName="Helvetica-Bold", textColor=NAVY, leading=10)),
                    Paragraph(formula if formula != "N/A" else "—", mono),
                    Paragraph(val, ParagraphStyle("StepVal", fontSize=9, fontName="Helvetica-Bold", textColor=BLUE, leading=12)),
                    Paragraph(norm, ParagraphStyle("StepNorm", fontSize=7, textColor=SLATE, leading=10)),
                ])

            col_widths = [5 * cm, 4.5 * cm, 4 * cm, 3.5 * cm]
            tbl = Table(rows, colWidths=col_widths, repeatRows=1)
            tbl.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), NAVY),
                ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, 0), 8),
                ("GRID", (0, 0), (-1, -1), 0.4, BORDER),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, LIGHT_BG]),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("LEFTPADDING", (0, 0), (-1, -1), 5),
                ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                ("ALIGN", (2, 0), (2, -1), "RIGHT"),
                ("ALIGN", (3, 0), (3, -1), "RIGHT"),
            ]))
            story.append(tbl)
            story.append(Spacer(1, 4 * mm))

        # ── 4. Constants ─────────────────────────────────────────────────────
        constants = data.get("constants_used")
        if constants:
            story.append(Paragraph("4. Premissas e Coeficientes Adotados", h2))
            const_rows = [["Parâmetro", "Valor Adotado"]]
            for k, v in constants.items():
                const_rows.append([
                    Paragraph(str(k), ParagraphStyle("CK", fontSize=9, textColor=NAVY, leading=11)),
                    Paragraph(str(v), ParagraphStyle("CV", fontSize=9, fontName="Courier", textColor=BLUE, leading=11)),
                ])
            const_tbl = Table(const_rows, colWidths=[9 * cm, None], repeatRows=1)
            const_tbl.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), LIGHT_BG),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, 0), 8),
                ("TEXTCOLOR", (0, 0), (-1, 0), NAVY),
                ("GRID", (0, 0), (-1, -1), 0.4, BORDER),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, LIGHT_BG]),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("ALIGN", (1, 0), (1, -1), "RIGHT"),
            ]))
            story.append(const_tbl)
            story.append(Spacer(1, 4 * mm))

        # ── 5. References ─────────────────────────────────────────────────────
        references = data.get("references")
        if references:
            story.append(Paragraph("5. Embasamento Normativo", h2))
            for ref in references:
                story.append(Paragraph(f"• {ref}", body))
            story.append(Spacer(1, 4 * mm))

        # ── Signature ─────────────────────────────────────────────────────────
        story.append(Spacer(1, 10 * mm))
        story.append(HRFlowable(width="40%", thickness=0.8, color=NAVY, hAlign="RIGHT"))
        engineer = data.get("engineer_crea", "Responsável Técnico")
        story.append(Paragraph(engineer,
            ParagraphStyle("Sign", fontSize=9, fontName="Helvetica-Bold",
                           textColor=NAVY, alignment=2, spaceAfter=2)))
        story.append(Paragraph("Engenheiro Responsável — CREA",
            ParagraphStyle("SignSub", fontSize=7, textColor=SLATE, alignment=2)))

        return story
