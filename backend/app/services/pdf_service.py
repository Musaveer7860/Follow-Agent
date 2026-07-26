import io
import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT

def generate_meeting_pdf(meeting_title: str, date_str: str, duration: str, summary: str, decisions: list, tasks: list, risks: list, followups: list) -> bytes:
    """
    Generates a professional Minutes of Meeting (MOM) PDF document.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=22,
        textColor=colors.HexColor('#0F172A'),
        alignment=TA_LEFT,
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        textColor=colors.HexColor('#64748B'),
        spaceAfter=15
    )

    heading2_style = ParagraphStyle(
        'SectionHeader',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        textColor=colors.HexColor('#1E293B'),
        spaceBefore=12,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        textColor=colors.HexColor('#334155'),
        leading=14,
        spaceAfter=6
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        textColor=colors.HexColor('#FFFFFF'),
        alignment=TA_LEFT
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        textColor=colors.HexColor('#1E293B'),
        leading=11
    )

    story = []

    # Header section
    story.append(Paragraph("MINUTES OF MEETING", title_style))
    story.append(Paragraph(f"<b>Topic:</b> {meeting_title} &nbsp;|&nbsp; <b>Date:</b> {date_str} &nbsp;|&nbsp; <b>Duration:</b> {duration}", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#3B82F6'), spaceAfter=15))

    # Executive Summary
    story.append(Paragraph("Executive Summary", heading2_style))
    story.append(Paragraph(summary or "No summary recorded.", body_style))
    story.append(Spacer(1, 10))

    # Key Decisions
    if decisions:
        story.append(Paragraph("Key Decisions", heading2_style))
        for dec in decisions:
            story.append(Paragraph(f"• {dec}", body_style))
        story.append(Spacer(1, 10))

    # Action Items Table
    if tasks:
        story.append(Paragraph("Action Items & Ownership", heading2_style))
        table_data = [[
            Paragraph("Task Description", table_header_style),
            Paragraph("Owner", table_header_style),
            Paragraph("Deadline", table_header_style),
            Paragraph("Priority", table_header_style),
            Paragraph("Status", table_header_style)
        ]]

        for t in tasks:
            title = t.get("title", "") if isinstance(t, dict) else t.title
            owner = t.get("owner", "Unassigned") if isinstance(t, dict) else t.owner
            deadline = t.get("deadline", "TBD") if isinstance(t, dict) else (t.deadline or "TBD")
            priority = t.get("priority", "Medium") if isinstance(t, dict) else t.priority
            status = t.get("status", "Pending") if isinstance(t, dict) else t.status

            table_data.append([
                Paragraph(title, table_cell_style),
                Paragraph(owner, table_cell_style),
                Paragraph(deadline, table_cell_style),
                Paragraph(priority, table_cell_style),
                Paragraph(status, table_cell_style)
            ])

        task_table = Table(table_data, colWidths=[200, 90, 85, 65, 65])
        task_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1E293B')),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F8FAFC')]),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ]))
        story.append(task_table)
        story.append(Spacer(1, 12))

    # Identified Risks & Blockers
    if risks:
        story.append(Paragraph("Identified Risks & Blockers", heading2_style))
        for r in risks:
            story.append(Paragraph(f"⚠️ {r}", body_style))
        story.append(Spacer(1, 10))

    # Follow-ups
    if followups:
        story.append(Paragraph("Next Steps & Follow-ups", heading2_style))
        for f in followups:
            story.append(Paragraph(f"📌 {f}", body_style))
        story.append(Spacer(1, 10))

    # Footer
    story.append(Spacer(1, 20))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#CBD5E1'), spaceAfter=10))
    footer_text = f"Generated automatically by Follow Agent Intelligence Engine on {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}"
    story.append(Paragraph(footer_text, ParagraphStyle('Footer', parent=styles['Normal'], fontName='Helvetica-Oblique', fontSize=8, textColor=colors.HexColor('#94A3B8'), alignment=TA_CENTER)))

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
