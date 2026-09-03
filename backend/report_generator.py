from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak
)


def generate_report(
    output_path,
    filename,
    analysis,
    created_at=None
):

    # ---------------------------------------
    # PDF setup
    # ---------------------------------------

    document = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        rightMargin=18 * mm,
        leftMargin=18 * mm,
        topMargin=18 * mm,
        bottomMargin=18 * mm
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "ReportTitle",
        parent=styles["Title"],
        alignment=TA_CENTER,
        fontSize=24,
        spaceAfter=10
    )

    subtitle_style = ParagraphStyle(
        "ReportSubtitle",
        parent=styles["Normal"],
        alignment=TA_CENTER,
        fontSize=10,
        textColor=colors.grey,
        spaceAfter=20
    )

    heading_style = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        fontSize=16,
        spaceBefore=15,
        spaceAfter=8
    )

    normal_style = ParagraphStyle(
        "ReportNormal",
        parent=styles["Normal"],
        fontSize=10,
        leading=15,
        spaceAfter=6
    )

    small_style = ParagraphStyle(
        "Small",
        parent=styles["Normal"],
        fontSize=9,
        leading=13
    )

    story = []

    # ---------------------------------------
    # Title
    # ---------------------------------------

    story.append(
        Paragraph(
            "Resume Analysis Report",
            title_style
        )
    )

    story.append(
        Paragraph(
            f"Resume: {filename}",
            subtitle_style
        )
    )

    if created_at:
        story.append(
            Paragraph(
                f"Analysis Date: {created_at}",
                subtitle_style
            )
        )

    # ---------------------------------------
    # Overall Score
    # ---------------------------------------

    story.append(
        Paragraph(
            "Overall Score",
            heading_style
        )
    )

    overall_score = analysis.get(
        "overall_score",
        0
    )

    score_table = Table(
        [
            [
                "Overall",
                "ATS",
                "Content",
                "Structure",
                "Readability",
                "Achievements"
            ],
            [
                f"{overall_score}/100",
                f"{analysis.get('ats_score', 0)}/100",
                f"{analysis.get('content_score', 0)}/100",
                f"{analysis.get('structure_score', 0)}/100",
                f"{analysis.get('readability_score', 0)}/100",
                f"{analysis.get('quantifiable_score', 0)}/100"
            ]
        ],
        colWidths=[
            27 * mm,
            27 * mm,
            27 * mm,
            27 * mm,
            30 * mm,
            32 * mm
        ]
    )

    score_table.setStyle(
        TableStyle([
            (
                "BACKGROUND",
                (0, 0),
                (-1, 0),
                colors.HexColor("#2563eb")
            ),
            (
                "TEXTCOLOR",
                (0, 0),
                (-1, 0),
                colors.white
            ),
            (
                "ALIGN",
                (0, 0),
                (-1, -1),
                "CENTER"
            ),
            (
                "FONTNAME",
                (0, 0),
                (-1, 0),
                "Helvetica-Bold"
            ),
            (
                "FONTNAME",
                (0, 1),
                (-1, 1),
                "Helvetica-Bold"
            ),
            (
                "FONTSIZE",
                (0, 0),
                (-1, -1),
                8
            ),
            (
                "GRID",
                (0, 0),
                (-1, -1),
                0.5,
                colors.grey
            ),
            (
                "VALIGN",
                (0, 0),
                (-1, -1),
                "MIDDLE"
            ),
            (
                "TOPPADDING",
                (0, 0),
                (-1, -1),
                8
            ),
            (
                "BOTTOMPADDING",
                (0, 0),
                (-1, -1),
                8
            )
        ])
    )

    story.append(score_table)
    story.append(Spacer(1, 10))

    # ---------------------------------------
    # Summary
    # ---------------------------------------

    story.append(
        Paragraph(
            "Summary",
            heading_style
        )
    )

    story.append(
        Paragraph(
            analysis.get(
                "summary",
                "No summary available."
            ),
            normal_style
        )
    )

    # ---------------------------------------
    # Strengths
    # ---------------------------------------

    story.append(
        Paragraph(
            "Strengths",
            heading_style
        )
    )

    strengths = analysis.get(
        "strengths",
        []
    )

    if strengths:

        for strength in strengths:
            story.append(
                Paragraph(
                    f"• {strength}",
                    normal_style
                )
            )

    else:
        story.append(
            Paragraph(
                "No specific strengths identified.",
                normal_style
            )
        )

    # ---------------------------------------
    # Weaknesses
    # ---------------------------------------

    story.append(
        Paragraph(
            "Weaknesses",
            heading_style
        )
    )

    weaknesses = analysis.get(
        "weaknesses",
        []
    )

    if weaknesses:

        for weakness in weaknesses:
            story.append(
                Paragraph(
                    f"• {weakness}",
                    normal_style
                )
            )

    else:
        story.append(
            Paragraph(
                "No major weaknesses identified.",
                normal_style
            )
        )

    # ---------------------------------------
    # Skills
    # ---------------------------------------

    story.append(
        Paragraph(
            "Skills",
            heading_style
        )
    )

    technical_skills = analysis.get(
        "technical_skills",
        []
    )

    soft_skills = analysis.get(
        "soft_skills",
        []
    )

    story.append(
        Paragraph(
            "<b>Technical Skills:</b> "
            + (
                ", ".join(technical_skills)
                if technical_skills
                else "None detected"
            ),
            normal_style
        )
    )

    story.append(
        Paragraph(
            "<b>Soft Skills:</b> "
            + (
                ", ".join(soft_skills)
                if soft_skills
                else "None detected"
            ),
            normal_style
        )
    )

    # ---------------------------------------
    # Missing Keywords
    # ---------------------------------------

    story.append(
        Paragraph(
            "Missing Keywords",
            heading_style
        )
    )

    missing_keywords = analysis.get(
        "missing_keywords",
        []
    )

    if missing_keywords:

        story.append(
            Paragraph(
                ", ".join(missing_keywords),
                normal_style
            )
        )

    else:

        story.append(
            Paragraph(
                "No important missing keywords detected.",
                normal_style
            )
        )

    # ---------------------------------------
    # ATS Analysis
    # ---------------------------------------

    story.append(
        Paragraph(
            "ATS Analysis",
            heading_style
        )
    )

    ats_issues = analysis.get(
        "ats_issues",
        []
    )

    ats_suggestions = analysis.get(
        "ats_suggestions",
        []
    )

    story.append(
        Paragraph(
            "<b>ATS Issues</b>",
            normal_style
        )
    )

    for issue in ats_issues:
        story.append(
            Paragraph(
                f"• {issue}",
                normal_style
            )
        )

    if not ats_issues:
        story.append(
            Paragraph(
                "No major ATS issues detected.",
                normal_style
            )
        )

    story.append(
        Paragraph(
            "<b>ATS Suggestions</b>",
            normal_style
        )
    )

    for suggestion in ats_suggestions:
        story.append(
            Paragraph(
                f"• {suggestion}",
                normal_style
            )
        )

    # ---------------------------------------
    # Section Feedback
    # ---------------------------------------

    section_feedback = analysis.get(
        "section_feedback",
        {}
    )

    if section_feedback:

        story.append(
            Paragraph(
                "Section-wise Feedback",
                heading_style
            )
        )

        for section, feedback in section_feedback.items():

            section_name = (
                section[0].upper() +
                section[1:]
            )

            story.append(
                Paragraph(
                    f"<b>{section_name}</b>",
                    normal_style
                )
            )

            story.append(
                Paragraph(
                    str(feedback),
                    normal_style
                )
            )

    # ---------------------------------------
    # Improvements
    # ---------------------------------------

    improvements = analysis.get(
        "improvements",
        []
    )

    story.append(
        Paragraph(
            "Recommended Improvements",
            heading_style
        )
    )

    if improvements:

        for item in improvements:

            priority = item.get(
                "priority",
                "Medium"
            )

            area = item.get(
                "area",
                "General"
            )

            suggestion = item.get(
                "suggestion",
                ""
            )

            story.append(
                Paragraph(
                    f"<b>{priority} — {area}</b>",
                    normal_style
                )
            )

            story.append(
                Paragraph(
                    suggestion,
                    normal_style
                )
            )

    else:

        story.append(
            Paragraph(
                "No additional improvements available.",
                normal_style
            )
        )

    # ---------------------------------------
    # Final checklist
    # ---------------------------------------

    story.append(
        Paragraph(
            "Final Checklist",
            heading_style
        )
    )

    checklist = [
        "Resume is readable and properly structured.",
        "Important skills are clearly listed.",
        "Relevant job keywords should be included naturally.",
        "Achievements should include measurable results where possible.",
        "Resume should remain truthful and should not contain fabricated experience."
    ]

    for item in checklist:

        story.append(
            Paragraph(
                f"☐ {item}",
                normal_style
            )
        )

    # ---------------------------------------
    # Generate PDF
    # ---------------------------------------

    document.build(story)

    return output_path