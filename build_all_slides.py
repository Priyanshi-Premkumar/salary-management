"""
ACME CompensationOS - Master Presentation Generator
Builds a complete, 35-slide enterprise-grade architecture presentation (.pptx)
"""

import sys
import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def build_presentation():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Theme Colors
    COLOR_BG_DARK = RGBColor(15, 23, 42)        # Slate 900
    COLOR_BG_LIGHT = RGBColor(248, 250, 252)    # Slate 50
    COLOR_CARD_BG = RGBColor(255, 255, 255)     # White
    COLOR_CARD_BORDER = RGBColor(226, 232, 240) # Slate 200
    COLOR_NAVY = RGBColor(30, 58, 138)          # Blue 900
    COLOR_BLUE = RGBColor(37, 99, 235)          # Blue 600
    COLOR_SKY = RGBColor(2, 132, 199)           # Sky 600
    COLOR_TEXT_DARK = RGBColor(15, 23, 42)      # Slate 900
    COLOR_TEXT_MUTED = RGBColor(100, 116, 139)  # Slate 500
    COLOR_GREEN = RGBColor(5, 150, 105)         # Emerald 600
    COLOR_AMBER = RGBColor(217, 119, 6)         # Amber 600
    COLOR_RED = RGBColor(220, 38, 38)           # Red 600
    COLOR_PURPLE = RGBColor(124, 58, 237)       # Violet 600
    COLOR_CODE_BG = RGBColor(241, 245, 249)     # Slate 100

    def apply_light_bg(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = COLOR_BG_LIGHT
        bg.line.color.rgb = COLOR_BG_LIGHT
        return bg

    def add_header(slide, tag_text, title_text, subtitle_text=""):
        # Section Tag
        tag_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.733), Inches(0.25))
        tf_tag = tag_box.text_frame
        tf_tag.word_wrap = True
        tf_tag.margin_left = tf_tag.margin_top = tf_tag.margin_right = tf_tag.margin_bottom = 0
        p_tag = tf_tag.paragraphs[0]
        p_tag.text = tag_text.upper()
        p_tag.font.size = Pt(10)
        p_tag.font.bold = True
        p_tag.font.color.rgb = COLOR_BLUE

        # Slide Title
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.68), Inches(11.733), Inches(0.5))
        tf_title = title_box.text_frame
        tf_title.word_wrap = True
        tf_title.margin_left = tf_title.margin_top = tf_title.margin_right = tf_title.margin_bottom = 0
        p_title = tf_title.paragraphs[0]
        p_title.text = title_text
        p_title.font.size = Pt(22)
        p_title.font.bold = True
        p_title.font.color.rgb = COLOR_NAVY

        # Subtitle
        if subtitle_text:
            sub_box = slide.shapes.add_textbox(Inches(0.8), Inches(1.22), Inches(11.733), Inches(0.35))
            tf_sub = sub_box.text_frame
            tf_sub.word_wrap = True
            tf_sub.margin_left = tf_sub.margin_top = tf_sub.margin_right = tf_sub.margin_bottom = 0
            p_sub = tf_sub.paragraphs[0]
            p_sub.text = subtitle_text
            p_sub.font.size = Pt(12)
            p_sub.font.color.rgb = COLOR_TEXT_MUTED

    def add_footer(slide, current_idx, total_slides=35):
        line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(7.05), Inches(11.733), Inches(0.015))
        line.fill.solid()
        line.fill.fore_color.rgb = COLOR_CARD_BORDER
        line.line.color.rgb = COLOR_CARD_BORDER

        left_box = slide.shapes.add_textbox(Inches(0.8), Inches(7.1), Inches(8.0), Inches(0.3))
        tf_l = left_box.text_frame
        tf_l.margin_left = tf_l.margin_top = tf_l.margin_right = tf_l.margin_bottom = 0
        p_l = tf_l.paragraphs[0]
        p_l.text = "ACME CompensationOS • Enterprise Architecture & Engineering Presentation"
        p_l.font.size = Pt(9)
        p_l.font.color.rgb = COLOR_TEXT_MUTED

        right_box = slide.shapes.add_textbox(Inches(9.5), Inches(7.1), Inches(3.033), Inches(0.3))
        tf_r = right_box.text_frame
        tf_r.margin_left = tf_r.margin_top = tf_r.margin_right = tf_r.margin_bottom = 0
        p_r = tf_r.paragraphs[0]
        p_r.alignment = PP_ALIGN.RIGHT
        p_r.text = f"Slide {current_idx} of {total_slides} | Architecture Assessment"
        p_r.font.size = Pt(9)
        p_r.font.bold = True
        p_r.font.color.rgb = COLOR_TEXT_MUTED

    def add_card(slide, left, top, width, height, bg_color=COLOR_CARD_BG, border_color=COLOR_CARD_BORDER):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = bg_color
        card.line.color.rgb = border_color
        card.line.width = Pt(1.1)
        return card

    def add_bullet_card(slide, left, top, width, height, title, items, badge="", accent_color=COLOR_BLUE):
        add_card(slide, left, top, width, height)
        bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, top, width, Inches(0.08))
        bar.fill.solid()
        bar.fill.fore_color.rgb = accent_color
        bar.line.color.rgb = accent_color

        tb = slide.shapes.add_textbox(left + Inches(0.2), top + Inches(0.15), width - Inches(0.4), height - Inches(0.25))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        p_t = tf.paragraphs[0]
        p_t.text = title
        p_t.font.size = Pt(13)
        p_t.font.bold = True
        p_t.font.color.rgb = COLOR_NAVY

        for item in items:
            p = tf.add_paragraph()
            p.text = f"• {item}"
            p.font.size = Pt(10)
            p.font.color.rgb = COLOR_TEXT_DARK
            p.space_before = Pt(3.5)

    def add_table(slide, left, top, width, height, headers, data, col_widths=None):
        num_rows = len(data) + 1
        num_cols = len(headers)
        table_shape = slide.shapes.add_table(num_rows, num_cols, left, top, width, height)
        table = table_shape.table

        if col_widths and len(col_widths) == num_cols:
            for idx, w in enumerate(col_widths):
                table.columns[idx].width = w

        for c_idx, h_text in enumerate(headers):
            cell = table.cell(0, c_idx)
            cell.fill.solid()
            cell.fill.fore_color.rgb = COLOR_NAVY
            tf = cell.text_frame
            tf.word_wrap = True
            p = tf.paragraphs[0]
            p.text = str(h_text)
            p.font.size = Pt(10)
            p.font.bold = True
            p.font.color.rgb = RGBColor(255, 255, 255)

        for r_idx, row in enumerate(data):
            row_bg = COLOR_CARD_BG if r_idx % 2 == 0 else RGBColor(241, 245, 249)
            for c_idx, val in enumerate(row):
                cell = table.cell(r_idx + 1, c_idx)
                cell.fill.solid()
                cell.fill.fore_color.rgb = row_bg
                tf = cell.text_frame
                tf.word_wrap = True
                p = tf.paragraphs[0]
                p.text = str(val)
                p.font.size = Pt(9)
                p.font.color.rgb = COLOR_TEXT_DARK

    def set_notes(slide, notes_str):
        notes_slide = slide.notes_slide
        text_frame = notes_slide.notes_text_frame
        text_frame.text = notes_str

    print("Building full 35 slides...")

    # =========================================================================
    # SLIDE 1: Title Slide (Dark Theme Hero)
    # =========================================================================
    s1 = prs.slides.add_slide(blank_layout)
    bg1 = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
    bg1.fill.solid()
    bg1.fill.fore_color.rgb = COLOR_BG_DARK
    bg1.line.color.rgb = COLOR_BG_DARK

    pill = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.0), Inches(1.1), Inches(3.6), Inches(0.38))
    pill.fill.solid()
    pill.fill.fore_color.rgb = RGBColor(30, 41, 59)
    pill.line.color.rgb = COLOR_BLUE
    p_tf = pill.text_frame
    p_p = p_tf.paragraphs[0]
    p_p.alignment = PP_ALIGN.CENTER
    p_p.text = "ENTERPRISE ARCHITECTURE REVIEW"
    p_p.font.size = Pt(10)
    p_p.font.bold = True
    p_p.font.color.rgb = COLOR_SKY

    t_box = s1.shapes.add_textbox(Inches(1.0), Inches(1.65), Inches(11.3), Inches(1.9))
    t_tf = t_box.text_frame
    t_tf.word_wrap = True
    p1 = t_tf.paragraphs[0]
    p1.text = "ACME CompensationOS"
    p1.font.size = Pt(44)
    p1.font.bold = True
    p1.font.color.rgb = RGBColor(255, 255, 255)

    p2 = t_tf.add_paragraph()
    p2.text = "Enterprise Employee Salary & Multi-Currency Compensation Management Platform"
    p2.font.size = Pt(20)
    p2.font.color.rgb = RGBColor(148, 163, 184)
    p2.space_before = Pt(8)

    highlights = [
        ("10,000+ EMPLOYEES", "Deterministic 5-Country Population\n(India, USA, UK, Germany, UAE)", COLOR_BLUE),
        ("TEMPORAL INTEGRITY", "PostgreSQL btree_gist Exclusion\nZero-overlap effective dating", COLOR_GREEN),
        ("STRICT MULTI-CURRENCY", "Isolated INR, USD, EUR, GBP, AED\nNative PERCENTILE_CONT(0.5)", COLOR_SKY),
        ("CLEAN ARCHITECTURE", "Hexagonal Modular Monolith\nArchUnit verified boundaries", COLOR_PURPLE),
    ]
    card_w = Inches(2.65)
    card_gap = Inches(0.24)
    start_x = Inches(1.0)
    for i, (head, sub, col) in enumerate(highlights):
        c_x = start_x + i * (card_w + card_gap)
        c_shape = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, c_x, Inches(3.85), card_w, Inches(1.7))
        c_shape.fill.solid()
        c_shape.fill.fore_color.rgb = RGBColor(30, 41, 59)
        c_shape.line.color.rgb = col
        c_shape.line.width = Pt(1.5)
        c_tf = c_shape.text_frame
        c_tf.word_wrap = True
        c_tf.margin_top = Inches(0.18)
        cp1 = c_tf.paragraphs[0]
        cp1.text = head
        cp1.font.size = Pt(11)
        cp1.font.bold = True
        cp1.font.color.rgb = col
        cp2 = c_tf.add_paragraph()
        cp2.text = sub
        cp2.font.size = Pt(9.5)
        cp2.font.color.rgb = RGBColor(203, 213, 225)
        cp2.space_before = Pt(6)

    meta_box = s1.shapes.add_textbox(Inches(1.0), Inches(6.0), Inches(11.3), Inches(0.7))
    m_tf = meta_box.text_frame
    m_p = m_tf.paragraphs[0]
    m_p.text = "Role: Principal Software Architect & Lead Engineer  |  Stack: Spring Boot 3.3.4, Java 21/22, React 18, PostgreSQL 16  |  Production Review"
    m_p.font.size = Pt(11)
    m_p.font.color.rgb = RGBColor(148, 163, 184)

    set_notes(s1, "Welcome to the enterprise architecture review for ACME CompensationOS. This platform replaces fragile spreadsheets with a hardened, audit-grade, multi-currency compensation management system supporting 10,000 global employees. Over the next 34 slides, we will cover the complete PRD, High-Level Architecture, PostgreSQL temporal data modeling, REST API contracts, business logic, live demonstration flows, testing pyramid with ArchUnit, and future microservices readiness.")

    # =========================================================================
    # SLIDE 2: Table of Contents & Executive Agenda
    # =========================================================================
    s2 = prs.slides.add_slide(blank_layout)
    apply_light_bg(s2)
    add_header(s2, "EXECUTIVE AGENDA", "Table of Contents & Architecture Roadmap", "Comprehensive walk-through of engineering artifacts, architectural decisions, and production systems.")
    add_footer(s2, 2)

    agenda_items = [
        ("01", "Product Requirements (PRD)", "Problem context, personas, functional & non-functional requirements, and scope boundaries.", "Slides 3 – 7"),
        ("02", "High-Level Design (HLD)", "System context, multi-tier architecture, modular monolith design, SOLID, and deployment.", "Slides 8 – 12"),
        ("03", "ERD & Database Architecture", "Relational ER diagram, temporal btree_gist exclusion constraints, and transactional design.", "Slides 13 – 16"),
        ("04", "REST API & Backend Design", "API contracts, JSON payloads, atomic salary revision sequence, and security architecture.", "Slides 17 – 20"),
        ("05", "Business Logic & Analytics", "Salary revision workflows, multi-currency mathematical isolation, and PostgreSQL medians.", "Slides 21 – 23"),
        ("06", "Demo & User Interface", "Application navigation, SaaS UI mockups, and end-to-end evaluation demonstration script.", "Slides 24 – 27"),
        ("07", "Testing & Performance", "Testing pyramid, ArchUnit verification, 10k deterministic batch seed engine, and security.", "Slides 28 – 30"),
        ("08", "Microservice Evolution", "Future microservices blueprint, transactional outbox pattern, and monolith vs microservices trade-offs.", "Slides 31 – 32"),
        ("09", "Technical Documentation", "Repository documentation map, 10-phase implementation roadmap, and architectural summary.", "Slides 33 – 35"),
    ]

    col_w = Inches(3.7)
    row_h = Inches(1.5)
    for idx, (num, title, desc, s_range) in enumerate(agenda_items):
        col_idx = idx % 3
        row_idx = idx // 3
        c_left = Inches(0.8) + col_idx * (col_w + Inches(0.31))
        c_top = Inches(1.8) + row_idx * (row_h + Inches(0.2))

        add_card(s2, c_left, c_top, col_w, row_h)
        tb = s2.shapes.add_textbox(c_left + Inches(0.2), c_top + Inches(0.15), col_w - Inches(0.4), row_h - Inches(0.3))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        p = tf.paragraphs[0]
        p.text = f"{num}. {title}"
        p.font.size = Pt(12)
        p.font.bold = True
        p.font.color.rgb = COLOR_NAVY

        p_desc = tf.add_paragraph()
        p_desc.text = desc
        p_desc.font.size = Pt(9.5)
        p_desc.font.color.rgb = COLOR_TEXT_MUTED
        p_desc.space_before = Pt(3)

        p_rng = tf.add_paragraph()
        p_rng.text = s_range
        p_rng.font.size = Pt(9)
        p_rng.font.bold = True
        p_rng.font.color.rgb = COLOR_BLUE
        p_rng.space_before = Pt(4)

    set_notes(s2, "Our presentation is structured into nine core sections. We begin with the product requirements document to understand the business pain points and SLAs. We then explore the high-level architecture, database design with temporal exclusion constraints, API design, business logic, live demo flows, testing strategy, microservice extraction path, and concluding deliverables.")

    # =========================================================================
    # SLIDE 3: PRD - Problem Statement & Business Context
    # =========================================================================
    s3 = prs.slides.add_slide(blank_layout)
    apply_light_bg(s3)
    add_header(s3, "SECTION 1: PRODUCT REQUIREMENTS DOCUMENT", "Business Problem & The Spreadsheet Crisis", "Managing 10,000 multi-country employees on disjointed spreadsheets creates severe business risks.")
    add_footer(s3, 3)

    add_bullet_card(s3, Inches(0.8), Inches(1.8), Inches(3.7), Inches(4.8),
        "1. Data Fragility & Lost History",
        [
            "Spreadsheet Overwrite Flaw: When a salary revision occurs, previous compensation numbers are overwritten, obliterating historical promotion and tenure tracking.",
            "Broken Formulas: Cross-sheet VLOOKUPs and summation macros break across localized Office versions and corrupt executive payroll projections.",
            "Zero Concurrency Controls: Simultaneous updates by regional HR teams lead to silent data clobbering and conflicting compensation numbers."
        ], accent_color=COLOR_RED)

    add_bullet_card(s3, Inches(4.81), Inches(1.8), Inches(3.7), Inches(4.8),
        "2. Multi-Currency Catastrophe",
        [
            "Inappropriate Direct Aggregation: Spreadsheet cells add ₹1,500,000 INR directly to $120,000 USD, yielding meaningless, mathematically invalid payroll sums.",
            "Lack of Sovereign Isolation: Global compensation across 5 jurisdictions (India, USA, Germany, UK, UAE) lacks sovereign currency boundaries.",
            "Erroneous Medians: Excel calculations fail to isolate currency cohorts, leading to distorted executive reporting on department compensation medians."
        ], accent_color=COLOR_AMBER)

    add_bullet_card(s3, Inches(8.83), Inches(1.8), Inches(3.7), Inches(4.8),
        "3. Compliance & Security Void",
        [
            "Zero Audit Trail: Regulators and SOX auditors cannot identify who approved a salary increase, the effective date, or the business rationale.",
            "Formula Injection Vulnerability: Unsanitized CSV exports expose corporate workstations to CSV/DDE command execution via malicious cell values.",
            "Unrestricted Access: Unencrypted spreadsheet files stored in shared folders violate global employee data privacy regulations (GDPR, DPDP)."
        ], accent_color=COLOR_PURPLE)

    set_notes(s3, "The core problem ACME faces is that manual spreadsheets cannot handle compensation for 10,000 employees across 5 sovereign jurisdictions. Overwriting salary cells destroys historical career progression data. Mixing currencies in Excel yields fraudulent payroll figures. And lacking an immutable audit trail creates massive regulatory liability. CompensationOS was engineered specifically to solve these three critical failure domains.")

    # =========================================================================
    # SLIDE 4: PRD - Product Vision & Target Personas
    # =========================================================================
    s4 = prs.slides.add_slide(blank_layout)
    apply_light_bg(s4)
    add_header(s4, "SECTION 1: PRODUCT REQUIREMENTS DOCUMENT", "Product Vision, Strategic Objectives & Core Personas", "Empowering HR leadership with an audit-grade, centralized compensation single source of truth.")
    add_footer(s4, 4)

    # Top Vision Banner
    add_card(s4, Inches(0.8), Inches(1.8), Inches(11.733), Inches(1.1), bg_color=COLOR_NAVY, border_color=COLOR_NAVY)
    v_tb = s4.shapes.add_textbox(Inches(1.0), Inches(1.9), Inches(11.333), Inches(0.9))
    v_tf = v_tb.text_frame
    v_tf.word_wrap = True
    vp1 = v_tf.paragraphs[0]
    vp1.text = "PRODUCT VISION STATEMENT"
    vp1.font.size = Pt(10)
    vp1.font.bold = True
    vp1.font.color.rgb = COLOR_SKY
    vp2 = v_tf.add_paragraph()
    vp2.text = "\"To deliver a hardened, audit-grade compensation operating system that provides 100% data integrity, sub-second multi-currency analytics, zero-gap temporal revision timelines, and automated compliance for ACME's 10,000 global employees.\""
    vp2.font.size = Pt(12)
    vp2.font.color.rgb = RGBColor(255, 255, 255)
    vp2.space_before = Pt(3)

    # Persona Cards
    add_bullet_card(s4, Inches(0.8), Inches(3.1), Inches(5.7), Inches(3.6),
        "Primary Persona: HR Manager (Elena Vance)",
        [
            "Role & Context: Senior Compensation & People Operations Manager overseeing global headcount across India, US, and Europe.",
            "Primary Workflows: Searching and filtering 10k directory, executing effective-dated salary revisions, inputting merit increases, and downloading sanitized CSV exports.",
            "Key Pain Points: Terrified of date overlap errors, manual Excel recalculations, and failing compliance audits during executive compensation cycles.",
            "Success Metrics: Zero revision collisions, real-time delta preview calculations, instant audit trail generation, and sub-100ms directory searches."
        ], accent_color=COLOR_BLUE)

    add_bullet_card(s4, Inches(6.83), Inches(3.1), Inches(5.7), Inches(3.6),
        "Secondary Personas: Executive, Admin & Auditor",
        [
            "Executive Leadership (VP of HR, CFO): Requires instant macro-level compensation visibility; demands sovereign currency KPIs, department percentile medians, and salary band distributions without manual data manipulation.",
            "System Administrator (IT/SecOps): Manages user accounts, enforces role-based access control (RBAC), and monitors system health and batch data seeding.",
            "Internal Compliance Auditor: Requires immutable, tamper-evident audit trails with exact before/after salary snapshots, change reasons, timestamps, and verified user identities."
        ], accent_color=COLOR_GREEN)

    set_notes(s4, "Our design centers on our primary persona: Elena Vance, HR Manager. Elena needs to execute salary adjustments without fearing data corruption or accidental overlaps. She requires real-time delta calculations and automated audit logs. Simultaneously, our secondary personas—executives and compliance auditors—rely on the system for mathematically sound multi-currency analytics and tamper-evident audit trails.")

    # =========================================================================
    # SLIDE 5: PRD - Functional Requirements Matrix
    # =========================================================================
    s5 = prs.slides.add_slide(blank_layout)
    apply_light_bg(s5)
    add_header(s5, "SECTION 1: PRODUCT REQUIREMENTS DOCUMENT", "Functional Requirements Matrix", "Detailed breakdown of the seven core functional domains powering ACME CompensationOS.")
    add_footer(s5, 5)

    headers_fr = ["Domain", "Requirement Code", "Feature Description", "Business Value & SLA"]
    data_fr = [
        ["Employee Directory", "FR-EMP-01..04", "Full lifecycle management, paginated listing of 10,000 employees, multi-attribute filtering (Country, Dept, Role, Status), and debounced search.", "Instant talent discovery; sub-50ms search latency across 10k rows."],
        ["Compensation Timeline", "FR-CMP-01..03", "Initial salary/bonus assignment, ISO-4217 sovereign currencies, exact DECIMAL(19,4) numeric precision; zero floating-point arithmetic.", "Guaranteed financial accuracy; elimination of binary float rounding errors."],
        ["Temporal Effective Dating", "FR-CMP-04..05", "Past, current, and future scheduled salary revisions. Automatic non-destructive interval slicing with PostgreSQL btree_gist exclusion.", "Zero overlapping date ranges; complete historical career progression preservation."],
        ["Multi-Currency Analytics", "FR-ANA-01..05", "Sovereign currency segregation (INR, USD, EUR, GBP, AED), native PostgreSQL PERCENTILE_CONT(0.5) medians, and dynamic threshold projections.", "Statistically sound executive reporting without invalid cross-currency mixing."],
        ["Audit Trail & Governance", "FR-AUD-01..03", "Atomic append-only audit logging on every revision; captures previous/new compensation, actor email from JWT context, and business reason.", "100% compliance audit readiness; tamper-evident historical governance."],
        ["Secure Data Export", "FR-EXP-01..02", "Streaming CSV export of directory and audit records with automatic formula injection sanitization (=, +, -, @ neutralized).", "Protects executive workstations from spreadsheet DDE/CSV injection attacks."],
        ["Authentication & RBAC", "FR-SEC-01..03", "Stateless JWT authentication, BCrypt password hashing, and role-based authorization (ADMIN, HR_MANAGER, EXECUTIVE).", "Prevents unauthorized compensation disclosure and privilege escalation."]
    ]
    col_w_fr = [Inches(1.8), Inches(1.5), Inches(5.0), Inches(3.433)]
    add_table(s5, Inches(0.8), Inches(1.8), Inches(11.733), Inches(4.8), headers_fr, data_fr, col_w_fr)

    set_notes(s5, "This matrix summarizes the seven functional pillars of CompensationOS. Notice the emphasis on mathematical precision with DECIMAL(19,4), temporal integrity with btree_gist exclusion, and security through formula-sanitized CSV streaming. Each requirement maps directly to measurable business value and verified implementation code.")

    # =========================================================================
    # SLIDE 6: PRD - Non-Functional Requirements & Enterprise SLAs
    # =========================================================================
    s6 = prs.slides.add_slide(blank_layout)
    apply_light_bg(s6)
    add_header(s6, "SECTION 1: PRODUCT REQUIREMENTS DOCUMENT", "Non-Functional Requirements & Enterprise SLAs", "Rigorous engineering standards for performance, scalability, integrity, and security.")
    add_footer(s6, 6)

    nfr_cards = [
        ("High-Scale Performance", "NFR-PERF-01", ["Sub-50ms directory search across 10,000 active employees.", "Sub-100ms multi-currency analytics queries via DB composite indexes.", "Deterministic 10,000 employee batch seeding executed in < 3.5 seconds."], COLOR_BLUE),
        ("Storage-Level Data Integrity", "NFR-DATA-01", ["PostgreSQL btree_gist exclusion constraints guarantee zero overlapping dates.", "Composite foreign key constraints enforce relational parent-child boundaries.", "DECIMAL(19,4) monetary precision eliminates IEEE-754 float drift."], COLOR_GREEN),
        ("Security & Zero Trust", "NFR-SEC-01", ["Stateless HMAC-SHA384 JWT tokens with strict expiration.", "BCrypt password hashing with work factor 10.", "Actor identity extracted exclusively from authenticated SecurityContext."], COLOR_PURPLE),
        ("Audit Immutability", "NFR-AUD-01", ["Write-only append-only architecture for salary audit trail.", "Zero HTTP PUT/DELETE routes exposed for audit records.", "Atomic rollback: failure to record audit rolls back salary revision."], COLOR_AMBER),
        ("Modular Maintainability", "NFR-ARCH-01", ["Clean Architecture enforced statically via ArchUnit test suites.", "Zero circular package dependencies across domain and application layers.", "Public Port interfaces decouple modules; zero cross-module JPA leaks."], COLOR_SKY),
        ("High Reliability & SLAs", "NFR-REL-01", ["99.9% application uptime for business-critical compensation operations.", "Pessimistic write locking (SELECT FOR UPDATE) prevents race conditions.", "Full Docker Compose containerization with health checks and data volumes."], COLOR_NAVY),
    ]

    for idx, (title, code, bullets, color) in enumerate(nfr_cards):
        c_left = Inches(0.8) + (idx % 3) * (Inches(3.7) + Inches(0.31))
        c_top = Inches(1.8) + (idx // 3) * (Inches(2.35) + Inches(0.2))
        add_bullet_card(s6, c_left, c_top, Inches(3.7), Inches(2.35), f"{title} ({code})", bullets, accent_color=color)

    set_notes(s6, "Non-functional requirements dictate the platform's reliability. We committed to sub-50ms search latency, sub-100ms analytics, and sub-3.5 second 10k batch seeding. Crucially, temporal integrity is not merely an application-layer check—it is enforced by PostgreSQL storage engine constraints via btree_gist.")

    # =========================================================================
    # SLIDE 7: PRD - Scope Boundaries, Assumptions & Definition of Done
    # =========================================================================
    s7 = prs.slides.add_slide(blank_layout)
    apply_light_bg(s7)
    add_header(s7, "SECTION 1: PRODUCT REQUIREMENTS DOCUMENT", "Scope Boundaries, Assumptions & Definition of Done", "Clear demarcation between production MVP deliverables and future architectural milestones.")
    add_footer(s7, 7)

    add_bullet_card(s7, Inches(0.8), Inches(1.8), Inches(5.7), Inches(4.8),
        "In-Scope (Delivered Production MVP)",
        [
            "10,000 Deterministic Employees: Seeded across India (3,500 INR), USA (2,500 USD), Germany (1,500 EUR), UK (1,500 GBP), and UAE (1,000 AED).",
            "Temporal Effective Dating: Non-destructive revision slicing, zero-gap date adjustments, and btree_gist overlap exclusion.",
            "Sovereign Multi-Currency Analytics: Isolated reporting, PostgreSQL PERCENTILE_CONT(0.5) medians, and salary threshold calculator.",
            "Atomic Audit Logging: Mandatory revision logs capturing previous/new salary diffs and authenticated actor email in a single transaction.",
            "Polished React 18 SaaS UI: Dashboard KPIs, filterable directory, employee profile, revision modal with live delta calculator, and audit explorer.",
            "Security & Sanitization: JWT authentication, RBAC method security, and formula-neutralized CSV streaming export.",
            "Verified ArchUnit Suite: 5 architectural boundary rules passing with zero violations."
        ], accent_color=COLOR_GREEN)

    add_bullet_card(s7, Inches(6.83), Inches(1.8), Inches(5.7), Inches(4.8),
        "Future Enhancements & Definition of Done (DoD)",
        [
            "Planned Future Enhancements (Phase 2):",
            "• Live FX Feed Integration: Daily exchange rate sync for consolidated multi-currency reporting.",
            "• Multi-Level Approval Workflows: Managerial review gates for revisions exceeding 15% increase.",
            "• Payroll Tax Engine: Automated statutory deductions for India (PF), USA (W2), and Germany (Sozialversicherung).",
            "• Equity & Stock Grant Tracking: Vesting schedule management for RSUs.",
            "",
            "Explicit Definition of Done (DoD) Checklist:",
            "✓ All 23 backend tests passing cleanly (ArchUnit, Service, Integration, E2E).",
            "✓ Zero overlapping compensation date ranges validated under concurrent load.",
            "✓ 10,000 employees seeded in < 3.5s with ~30% multi-revision histories.",
            "✓ Frontend compiles with zero TypeScript errors; responsive Tailwind UI."
        ], accent_color=COLOR_AMBER)

    set_notes(s7, "To maintain engineering discipline, we strictly distinguish MVP deliverables from future enhancements. In-scope is a complete, working platform with 10k employees, temporal integrity, and multi-currency analytics. Out-of-scope for MVP are external FX feeds and payroll tax engines, which belong in Phase 2. Every item on our Definition of Done checklist has been verified.")

    # =========================================================================
    # SLIDE 8: HLD - Diagram 1: System Context Diagram (C4 Level 1)
    # =========================================================================
    s8 = prs.slides.add_slide(blank_layout)
    apply_light_bg(s8)
    add_header(s8, "SECTION 2: HIGH-LEVEL DESIGN (HLD)", "Diagram 1: System Context Diagram (C4 Level 1)", "High-level visual representation of system actors, boundaries, and enterprise integration touchpoints.")
    add_footer(s8, 8)

    # Actor Box
    add_card(s8, Inches(0.8), Inches(2.2), Inches(2.6), Inches(3.8), bg_color=RGBColor(241, 245, 249), border_color=COLOR_BLUE)
    a_tb = s8.shapes.add_textbox(Inches(0.9), Inches(2.4), Inches(2.4), Inches(3.4))
    a_tf = a_tb.text_frame
    a_tf.word_wrap = True
    ap = a_tf.paragraphs[0]
    ap.text = "HUMAN ACTORS"
    ap.font.size = Pt(11)
    ap.font.bold = True
    ap.font.color.rgb = COLOR_BLUE

    ap1 = a_tf.add_paragraph()
    ap1.text = "👤 HR Manager\nExecutes revisions, manages employee directory, downloads CSV."
    ap1.font.size = Pt(9.5)
    ap1.font.color.rgb = COLOR_TEXT_DARK
    ap1.space_before = Pt(8)

    ap2 = a_tf.add_paragraph()
    ap2.text = "👤 Executive Leader\nViews sovereign currency KPIs, department medians, and salary distributions."
    ap2.font.size = Pt(9.5)
    ap2.font.color.rgb = COLOR_TEXT_DARK
    ap2.space_before = Pt(8)

    ap3 = a_tf.add_paragraph()
    ap3.text = "👤 Compliance Auditor\nInspects tamper-evident salary change audit trails."
    ap3.font.size = Pt(9.5)
    ap3.font.color.rgb = COLOR_TEXT_DARK
    ap3.space_before = Pt(8)

    # Core System Boundary Box
    add_card(s8, Inches(3.9), Inches(1.8), Inches(5.5), Inches(4.8), bg_color=COLOR_CARD_BG, border_color=COLOR_NAVY)
    cs_tb = s8.shapes.add_textbox(Inches(4.1), Inches(1.95), Inches(5.1), Inches(0.4))
    cs_tf = cs_tb.text_frame
    csp = cs_tf.paragraphs[0]
    csp.text = "ACME COMPENSATIONOS PLATFORM BOUNDARY"
    csp.font.size = Pt(11)
    csp.font.bold = True
    csp.font.color.rgb = COLOR_NAVY

    # Inside Core System: Frontend & Backend Cards
    add_bullet_card(s8, Inches(4.2), Inches(2.5), Inches(4.9), Inches(1.7),
        "Single Page Application (React 18 + Vite)",
        [
            "Interactive SaaS interface running in user browser over HTTPS.",
            "Client-side routing, TanStack Query cache, Recharts visualizations.",
            "Stateful JWT storage with automatic Bearer header propagation."
        ], accent_color=COLOR_SKY)

    add_bullet_card(s8, Inches(4.2), Inches(4.5), Inches(4.9), Inches(1.8),
        "Modular Monolith Backend (Spring Boot 3.3.4)",
        [
            "REST API endpoints with Spring Security 6 & JWT verification.",
            "Domain business logic, temporal revision engine, and audit service.",
            "Streaming CSV generation with formula injection sanitization."
        ], accent_color=COLOR_BLUE)

    # Database Box
    add_card(s8, Inches(9.8), Inches(2.2), Inches(2.7), Inches(3.8), bg_color=RGBColor(241, 245, 249), border_color=COLOR_GREEN)
    db_tb = s8.shapes.add_textbox(Inches(9.9), Inches(2.4), Inches(2.5), Inches(3.4))
    db_tf = db_tb.text_frame
    db_tf.word_wrap = True
    dbp = db_tf.paragraphs[0]
    dbp.text = "PERSISTENCE TIER"
    dbp.font.size = Pt(11)
    dbp.font.bold = True
    dbp.font.color.rgb = COLOR_GREEN

    dbp1 = db_tf.add_paragraph()
    dbp1.text = "🗄️ PostgreSQL 16\n• btree_gist temporal exclusion constraint.\n• 10,000 employee records.\n• 13,728 compensation rows.\n• 3,728 immutable audit logs."
    dbp1.font.size = Pt(9.5)
    dbp1.font.color.rgb = COLOR_TEXT_DARK
    dbp1.space_before = Pt(8)

    dbp2 = db_tf.add_paragraph()
    dbp2.text = "⚡ Engine Analytics\n• PERCENTILE_CONT(0.5) medians.\n• Composite B-Tree indexes.\n• Sub-millisecond scan latency."
    dbp2.font.size = Pt(9.5)
    dbp2.font.color.rgb = COLOR_TEXT_DARK
    dbp2.space_before = Pt(8)

    set_notes(s8, "This C4 Level 1 System Context diagram illustrates the system boundaries. Users interact via the React 18 SPA over HTTPS. The frontend talks to the Spring Boot backend via REST APIs secured with JWTs. The backend communicates over JDBC with PostgreSQL 16, which acts as the ultimate authority for relational integrity, temporal exclusion, and statistical aggregations.")

    # =========================================================================
    # SLIDE 9: HLD - Diagram 2: High-Level Architecture (C4 Level 2)
    # =========================================================================
    s9 = prs.slides.add_slide(blank_layout)
    apply_light_bg(s9)
    add_header(s9, "SECTION 2: HIGH-LEVEL DESIGN (HLD)", "Diagram 2: High-Level Architecture & Layered Tiers", "End-to-end multi-tier technology stack from presentation down to database persistence.")
    add_footer(s9, 9)

    layers = [
        ("Presentation Layer", "React 18 • Vite • TypeScript • Tailwind CSS • TanStack Query • React Hook Form • Zod • Recharts • Lucide", COLOR_SKY,
         "Client-side SPA rendering; optimistic caching; debounced directory search; real-time revision delta calculation; interactive Recharts visualizations."),
        ("REST API Layer", "Spring MVC Controllers • SpringDoc OpenAPI 3 (Swagger) • DTO Request/Response Mappers • Global Exception Advice", COLOR_BLUE,
         "Exposes secure RESTful endpoints; validates payload contracts using Jakarta Validation; returns standardized ProblemDetail error responses."),
        ("Application Layer", "Use Case Orchestrators • Inbound Ports (Interfaces) • Outbound Ports (SPIs) • Domain Event Publishers", COLOR_PURPLE,
         "Orchestrates business workflows (EmployeeService, CompensationService, AnalyticsService, AuditService, SeedDataService); manages transaction boundaries."),
        ("Domain Layer", "Core Business Entities • Value Objects (Money, CurrencyCode) • Domain Exceptions • Invariant Rules", COLOR_GREEN,
         "Pure, framework-agnostic business logic; strict Money currency matching; employment status transitions; zero external dependencies."),
        ("Infrastructure Layer", "Spring Data JPA Adapters • Spring Security 6 Filter Chain • BCrypt • HikariCP Pool • Flyway Migrations", COLOR_AMBER,
         "Implements outbound repository ports; executes SQL via Hibernate ORM; enforces method security; coordinates database schema migrations."),
        ("Persistence Layer", "PostgreSQL 16 Relational & Temporal Database • btree_gist Extension • Native PERCENTILE_CONT(0.5)", COLOR_NAVY,
         "Storage engine enforcing daterange non-overlap exclusion constraints, foreign key cascades, and high-performance continuous percentile medians.")
    ]

    l_top = Inches(1.8)
    l_h = Inches(0.78)
    l_gap = Inches(0.08)
    for idx, (title, tech, color, desc) in enumerate(layers):
        c_y = l_top + idx * (l_h + l_gap)
        card = add_card(s9, Inches(0.8), c_y, Inches(11.733), l_h)
        bar = s9.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), c_y, Inches(0.1), l_h)
        bar.fill.solid()
        bar.fill.fore_color.rgb = color
        bar.line.color.rgb = color

        tb = s9.shapes.add_textbox(Inches(1.05), c_y + Inches(0.08), Inches(11.3), l_h - Inches(0.16))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        p1 = tf.paragraphs[0]
        p1.text = f"{title.upper()}  —  {tech}"
        p1.font.size = Pt(11)
        p1.font.bold = True
        p1.font.color.rgb = COLOR_NAVY

        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(9.5)
        p2.font.color.rgb = COLOR_TEXT_MUTED
        p2.space_before = Pt(2)

    set_notes(s9, "Here we see the six distinct architectural tiers. The request flows from the React presentation tier through the REST API controllers, into application use case services, which operate on pure domain entities. Outbound ports are fulfilled by infrastructure persistence adapters, which write to PostgreSQL 16. Notice how each tier has isolated, singular responsibilities.")

    # =========================================================================
    # SLIDE 10: HLD - Diagram 3: Modular Monolith Architecture
    # =========================================================================
    s10 = prs.slides.add_slide(blank_layout)
    apply_light_bg(s10)
    add_header(s10, "SECTION 2: HIGH-LEVEL DESIGN (HLD)", "Diagram 3: Modular Monolith Architecture & Boundaries", "Enforcing strict module boundaries and public contracts to ensure microservice readiness.")
    add_footer(s10, 10)

    modules = [
        ("security Module", "User authentication, JWT token generation, password encryption, and Spring Security context management.", "Public: UserDetailsService, JwtProvider\nTables: users", COLOR_PURPLE),
        ("employee Module", "Employee lifecycle directory, status transitions, profile updates, and filtered directory search.", "Public: EmployeeReaderPort\nTables: employees", COLOR_BLUE),
        ("compensation Module", "Effective-dated salary management, interval slicing, and concurrent pessimistic locking.", "Public: ReviseCompensationUseCase\nTables: compensation", COLOR_GREEN),
        ("analytics Module", "Native SQL projections, multi-currency KPI calculation, and department median analytics.", "Public: AnalyticsQueryPort\nTables: Projections over DB", COLOR_SKY),
        ("audit Module", "Immutable salary revision logging, diff recording, and CSV compliance export.", "Public: SalaryAuditWriterPort\nTables: salary_audit_logs", COLOR_AMBER),
        ("shared Module", "Shared value objects (Money, CurrencyCode), cross-module port interfaces, and global exceptions.", "Public: Money, CsvSanitizer\nTables: None (Pure Domain)", COLOR_NAVY)
    ]

    m_w = Inches(3.7)
    m_h = Inches(1.9)
    for idx, (m_title, m_desc, m_contract, m_col) in enumerate(modules):
        c_x = Inches(0.8) + (idx % 3) * (m_w + Inches(0.31))
        c_y = Inches(1.8) + (idx // 3) * (m_h + Inches(0.2))
        add_card(s10, c_x, c_y, m_w, m_h)

        bar = s10.shapes.add_shape(MSO_SHAPE.RECTANGLE, c_x, c_y, m_w, Inches(0.08))
        bar.fill.solid()
        bar.fill.fore_color.rgb = m_col
        bar.line.color.rgb = m_col

        tb = s10.shapes.add_textbox(c_x + Inches(0.2), c_y + Inches(0.15), m_w - Inches(0.4), m_h - Inches(0.25))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        p1 = tf.paragraphs[0]
        p1.text = m_title
        p1.font.size = Pt(12)
        p1.font.bold = True
        p1.font.color.rgb = COLOR_NAVY

        p2 = tf.add_paragraph()
        p2.text = m_desc
        p2.font.size = Pt(9.5)
        p2.font.color.rgb = COLOR_TEXT_DARK
        p2.space_before = Pt(3)

        p3 = tf.add_paragraph()
        p3.text = m_contract
        p3.font.size = Pt(9)
        p3.font.bold = True
        p3.font.color.rgb = m_col
        p3.space_before = Pt(4)

    # Bottom Architectural Rule Banner
    add_card(s10, Inches(0.8), Inches(6.05), Inches(11.733), Inches(0.85), bg_color=RGBColor(241, 245, 249), border_color=COLOR_NAVY)
    r_tb = s10.shapes.add_textbox(Inches(1.0), Inches(6.12), Inches(11.3), Inches(0.7))
    r_tf = r_tb.text_frame
    r_tf.word_wrap = True
    rp1 = r_tf.paragraphs[0]
    rp1.text = "CRITICAL ARCHITECTURAL BOUNDARY RULE & MONOLITH RATIONALE:"
    rp1.font.size = Pt(10)
    rp1.font.bold = True
    rp1.font.color.rgb = COLOR_NAVY
    rp2 = r_tf.add_paragraph()
    rp2.text = "• Modules communicate exclusively via Java Interfaces (Ports) and DTOs. Compensation NEVER imports JPA entities or repositories from Employee.\n• Modular Monolith Chosen Over Microservices: Guarantees single-transaction ACID consistency across revisions and audit logs without distributed transaction overhead."
    rp2.font.size = Pt(9)
    rp2.font.color.rgb = COLOR_TEXT_MUTED
    rp2.space_before = Pt(2)

    set_notes(s10, "Why a modular monolith? At 10,000 employees, premature microservices would introduce distributed transactions, 2-phase commit latency, and network partitioning failures. Instead, our modular monolith enforces strict encapsulation: modules communicate only via Java interface ports. If we need to extract Compensation into a standalone microservice tomorrow, the bounded contexts and public ports are already cleanly separated.")

    # =========================================================================
    # SLIDE 11: HLD - Diagram 4: Clean Architecture & SOLID
    # =========================================================================
    s11 = prs.slides.add_slide(blank_layout)
    apply_light_bg(s11)
    add_header(s11, "SECTION 2: HIGH-LEVEL DESIGN (HLD)", "Diagram 4: Clean Architecture & SOLID Principles", "Enforcing hexagonal onion architecture and SOLID principles verified statically via ArchUnit.")
    add_footer(s11, 11)

    # Left Card: Onion Architecture
    add_bullet_card(s11, Inches(0.8), Inches(1.8), Inches(5.7), Inches(4.8),
        "Hexagonal Onion Architecture",
        [
            "Domain Layer (Center): Contains pure Java business models (Employee, Compensation, Money, CurrencyCode). Zero dependencies on Spring, JPA, Hibernate, or web frameworks.",
            "Application Layer (Inner Ring): Encapsulates use case orchestration (CompensationService, EmployeeService) and defines Inbound/Outbound Port interfaces.",
            "Infrastructure Layer (Outer Ring): Implements ports via Spring Data JPA persistence adapters, BCrypt security services, and HikariCP connection pools.",
            "API Layer (Periphery): Exposes HTTP REST controllers and handles JSON serialization without leaking domain entities to clients.",
            "Dependency Rule: Dependencies always point inward. The domain core knows nothing about databases, controllers, or HTTP protocols."
        ], accent_color=COLOR_GREEN)

    # Right Card: SOLID & ArchUnit Verification
    add_bullet_card(s11, Inches(6.83), Inches(1.8), Inches(5.7), Inches(4.8),
        "SOLID Principles & ArchUnit Verification",
        [
            "Single Responsibility (SRP): CompensationService only manages salary revisions; AuditService only records compliance history.",
            "Open/Closed (OCP): New persistence stores or export formats can be plugged in by implementing ports without modifying use cases.",
            "Liskov Substitution (LSP): Repository adapters can be swapped with in-memory test doubles without altering business behavior.",
            "Interface Segregation (ISP): Fine-grained ports (CompensationLookupPort, CompensationInitPort) prevent bloated interfaces.",
            "Dependency Inversion (DIP): Services depend on interface ports; persistence adapters implement them.",
            "",
            "ArchUnit Automated Architecture Tests (ArchitectureTest.java):",
            "✓ Statically verifies domain has zero dependencies on infrastructure.",
            "✓ Enforces that controllers only call application service interfaces.",
            "✓ Validates zero circular package dependencies across the entire build."
        ], accent_color=COLOR_BLUE)

    set_notes(s11, "Clean Architecture is not just a diagram on a slide—it is enforced in our build via ArchUnit. In ArchitectureTest.java, we have 5 automated rules that fail the Maven build if an engineer violates the dependency rule or introduces a circular package dependency. This ensures the codebase remains maintainable over years of enterprise evolution.")

    # =========================================================================
    # SLIDE 12: HLD - Diagram 5: Deployment & Container Architecture
    # =========================================================================
    s12 = prs.slides.add_slide(blank_layout)
    apply_light_bg(s12)
    add_header(s12, "SECTION 2: HIGH-LEVEL DESIGN (HLD)", "Diagram 5: Deployment & Container Architecture", "Production-ready multi-container topology orchestrating React, Spring Boot, and PostgreSQL.")
    add_footer(s12, 12)

    # 3 Containers
    containers = [
        ("Container: compensation-frontend", "Nginx 1.25 Alpine (Port 80)",
         [
             "Multi-stage Docker build: node:20-alpine compiles React SPA via Vite.",
             "Nginx serves static HTML, CSS, and JS chunks with gzip compression.",
             "Reverse proxy configuration: forwards /api/ traffic directly to backend container.",
             "SPA client-side routing fallback: try_files $uri $uri/ /index.html."
         ], COLOR_SKY),
        ("Container: compensation-backend", "Eclipse Temurin 21 JRE Alpine (Port 8080)",
         [
             "Multi-stage Maven build: compiles executable Spring Boot fat JAR.",
             "Runs as unprivileged security user (appuser in appgroup).",
             "Healthcheck dependency: waits for postgres container to report healthy.",
             "Configured with JVM memory limits and production environment variables."
         ], COLOR_BLUE),
        ("Container: compensation-postgres", "PostgreSQL 16 Alpine (Port 5432)",
         [
             "Persistent named volume: postgres_data preserves all database records.",
             "Extension btree_gist auto-installed via Flyway migration scripts.",
             "Docker healthcheck: pg_isready -U postgres -d compensation_db.",
             "Connection pooling managed via HikariCP on backend."
         ], COLOR_GREEN)
    ]

    for idx, (c_name, c_sub, c_bullets, c_col) in enumerate(containers):
        c_left = Inches(0.8) + idx * (Inches(3.7) + Inches(0.31))
        add_bullet_card(s12, c_left, Inches(1.8), Inches(3.7), Inches(4.0), c_name, c_bullets, accent_color=c_col)

    # Bottom Network & Secrets Card
    add_card(s12, Inches(0.8), Inches(6.0), Inches(11.733), Inches(0.9), bg_color=RGBColor(241, 245, 249), border_color=COLOR_NAVY)
    net_tb = s12.shapes.add_textbox(Inches(1.0), Inches(6.08), Inches(11.3), Inches(0.75))
    net_tf = net_tb.text_frame
    net_tf.word_wrap = True
    np1 = net_tf.paragraphs[0]
    np1.text = "CONTAINER ORCHESTRATION & ENVIRONMENT CONFIGURATION:"
    np1.font.size = Pt(10)
    np1.font.bold = True
    np1.font.color.rgb = COLOR_NAVY
    np2 = net_tf.add_paragraph()
    np2.text = "• Orchestrated via docker-compose.yml across an isolated bridge network.\n• Injected Secrets: SPRING_DATASOURCE_URL, JWT_SECRET, CORS_ALLOWED_ORIGINS.\n• Verified Environments: Local development (Vite :5173 + Spring Boot :8080) and Containerized deployment (Docker Compose :80)."
    np2.font.size = Pt(9)
    np2.font.color.rgb = COLOR_TEXT_MUTED
    np2.space_before = Pt(2)

    set_notes(s12, "Our deployment architecture uses Docker Compose to orchestrate three isolated containers. The React SPA is built via multi-stage Node compilation and served by Nginx Alpine, reverse proxying API traffic to Spring Boot. The backend runs securely on Temurin JRE under a non-root user. The database uses PostgreSQL 16 with a persistent named volume and automated Flyway migrations.")

    # =========================================================================
    # SLIDE 13: ERD - Diagram 6: Complete Relational ER Diagram
    # =========================================================================
    s13 = prs.slides.add_slide(blank_layout)
    apply_light_bg(s13)
    add_header(s13, "SECTION 3: ER DIAGRAM & DATABASE DESIGN", "Diagram 6: Complete Relational ER Diagram", "Normalized PostgreSQL relational schema modeling employees, temporal compensation, and audit trails.")
    add_footer(s13, 13)

    tables_erd = [
        ("users (Auth & Access)", "BIGSERIAL id (PK)\nVARCHAR email (UK, NOT NULL)\nVARCHAR password_hash (NOT NULL)\nVARCHAR role (ADMIN, HR_MANAGER, EXECUTIVE)\nBOOLEAN active (DEFAULT TRUE)\nTIMESTAMPTZ created_at", COLOR_PURPLE),
        ("employees (Personnel Core)", "BIGSERIAL id (PK)\nVARCHAR employee_code (UK, NOT NULL)\nVARCHAR first_name, last_name (NOT NULL)\nVARCHAR email (UK, NOT NULL)\nVARCHAR phone, country, department\nVARCHAR designation, employment_status\nDATE joining_date (NOT NULL)\nTIMESTAMPTZ created_at, updated_at", COLOR_BLUE),
        ("compensation (Temporal Core)", "BIGSERIAL id (PK)\nBIGINT employee_id (FK -> employees.id)\nDECIMAL base_salary (15,4, NOT NULL)\nDECIMAL bonus (15,4, DEFAULT 0.0000)\nVARCHAR currency (ISO-4217, NOT NULL)\nDATE effective_from (NOT NULL)\nDATE effective_to (NULLABLE)\nTIMESTAMPTZ created_at", COLOR_GREEN),
        ("salary_audit_logs (Compliance)", "BIGSERIAL id (PK)\nBIGINT employee_id (FK -> employees.id)\nVARCHAR changed_by (NOT NULL)\nDECIMAL previous_base_salary (15,4)\nDECIMAL new_base_salary (15,4)\nDECIMAL previous_bonus, new_bonus (15,4)\nVARCHAR currency, change_reason\nDATE effective_date\nTIMESTAMPTZ changed_at", COLOR_AMBER),
        ("exchange_rates (Future FX)", "BIGSERIAL id (PK)\nVARCHAR source_currency (ISO-4217)\nVARCHAR target_currency (ISO-4217)\nDECIMAL rate (15,6, NOT NULL)\nDATE effective_date (NOT NULL)\nTIMESTAMPTZ created_at", COLOR_SKY)
    ]

    for idx, (t_name, t_fields, t_col) in enumerate(tables_erd):
        if idx < 3:
            t_left = Inches(0.8) + idx * (Inches(3.7) + Inches(0.31))
            t_top = Inches(1.8)
            t_w = Inches(3.7)
            t_h = Inches(2.7)
        else:
            t_left = Inches(0.8) + (idx - 3) * (Inches(5.7) + Inches(0.33))
            t_top = Inches(4.7)
            t_w = Inches(5.7)
            t_h = Inches(2.15)

        add_card(s13, t_left, t_top, t_w, t_h)
        bar = s13.shapes.add_shape(MSO_SHAPE.RECTANGLE, t_left, t_top, t_w, Inches(0.08))
        bar.fill.solid()
        bar.fill.fore_color.rgb = t_col
        bar.line.color.rgb = t_col

        tb = s13.shapes.add_textbox(t_left + Inches(0.18), t_top + Inches(0.12), t_w - Inches(0.36), t_h - Inches(0.2))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        p1 = tf.paragraphs[0]
        p1.text = t_name
        p1.font.size = Pt(11)
        p1.font.bold = True
        p1.font.color.rgb = COLOR_NAVY

        p2 = tf.add_paragraph()
        p2.text = t_fields
        p2.font.size = Pt(8.5)
        p2.font.color.rgb = COLOR_TEXT_DARK
        p2.space_before = Pt(3)

    set_notes(s13, "This is the complete relational schema. Notice the relationship cardinalities: One Employee has Many Compensation records (1 to N) representing their historical timeline, and One Employee has Many Salary Audit Logs (1 to N). All financial values are modeled as DECIMAL(15,4) to guarantee exact monetary precision.")

    # =========================================================================
    # SLIDE 14: ERD - Diagram 7: Compensation Temporal Data Model
    # =========================================================================
    s14 = prs.slides.add_slide(blank_layout)
    apply_light_bg(s14)
    add_header(s14, "SECTION 3: ER DIAGRAM & DATABASE DESIGN", "Diagram 7: Compensation Temporal Data Model", "Preventing overlapping compensation intervals using PostgreSQL btree_gist exclusion constraints.")
    add_footer(s14, 14)

    # Timeline Visual Boxes
    add_bullet_card(s14, Inches(0.8), Inches(1.8), Inches(3.7), Inches(2.2),
        "Revision 1: Historical (Closed)",
        [
            "effective_from: 2024-01-01",
            "effective_to: 2024-12-31",
            "Base Salary: $100,000 | Bonus: $10,000",
            "Status: Closed past revision; preserved indefinitely for historical reporting."
        ], accent_color=COLOR_TEXT_MUTED)

    add_bullet_card(s14, Inches(4.81), Inches(1.8), Inches(3.7), Inches(2.2),
        "Revision 2: Current Active",
        [
            "effective_from: 2025-01-01",
            "effective_to: NULL (Indefinite)",
            "Base Salary: $115,000 | Bonus: $15,000",
            "Status: Current operational salary; queried for active payroll and daily operations."
        ], accent_color=COLOR_GREEN)

    add_bullet_card(s14, Inches(8.83), Inches(1.8), Inches(3.7), Inches(2.2),
        "Revision 3: Future Scheduled",
        [
            "effective_from: 2026-06-01",
            "effective_to: NULL (Scheduled)",
            "Base Salary: $130,000 | Bonus: $20,000",
            "Status: Future promotion; automatically becomes active when effective date arrives."
        ], accent_color=COLOR_BLUE)

    # Bottom Deep Dive Cards
    add_bullet_card(s14, Inches(0.8), Inches(4.2), Inches(5.7), Inches(2.65),
        "Non-Destructive Interval Slicing Logic",
        [
            "1. When revising compensation on date D, locate the existing active record encompassing D.",
            "2. Slice the prior record by setting its effective_to = D - 1 day.",
            "3. Execute saveAndFlush() to force Hibernate's ActionQueue to write the SQL UPDATE before the INSERT.",
            "4. Insert the new revision with effective_from = D and effective_to = nextFutureRecord.effectiveFrom - 1 day (or NULL).",
            "5. Guarantees continuous compensation coverage with zero gaps and zero day overlaps."
        ], accent_color=COLOR_PURPLE)

    # PostgreSQL Exclusion Constraint SQL Box
    add_card(s14, Inches(6.83), Inches(4.2), Inches(5.7), Inches(2.65), bg_color=COLOR_CODE_BG, border_color=COLOR_NAVY)
    sql_tb = s14.shapes.add_textbox(Inches(7.0), Inches(4.3), Inches(5.36), Inches(2.45))
    sql_tf = sql_tb.text_frame
    sql_tf.word_wrap = True
    sql_tf.margin_left = sql_tf.margin_top = sql_tf.margin_right = sql_tf.margin_bottom = 0

    sp = sql_tf.paragraphs[0]
    sp.text = "POSTGRESQL STORAGE-LEVEL EXCLUSION CONSTRAINT:"
    sp.font.size = Pt(10)
    sp.font.bold = True
    sp.font.color.rgb = COLOR_NAVY

    sp_code = sql_tf.add_paragraph()
    sp_code.text = "CREATE EXTENSION IF NOT EXISTS btree_gist;\n\nALTER TABLE compensation\nADD CONSTRAINT no_overlapping_compensation_ranges\nEXCLUDE USING gist (\n    employee_id WITH =,\n    daterange(\n        effective_from,\n        COALESCE(effective_to, 'infinity'::date),\n        '[]'\n    ) WITH &&\n);"
    sp_code.font.size = Pt(8.5)
    sp_code.font.color.rgb = COLOR_NAVY
    sp_code.space_before = Pt(4)

    set_notes(s14, "This slide illustrates temporal effective dating. How do we guarantee an employee never has overlapping salary records? We do not rely solely on Java code. We use PostgreSQL's btree_gist extension with a GiST exclusion constraint on daterange. If two concurrent transactions attempt to insert overlapping date ranges for the same employee, PostgreSQL aborts the second transaction at the storage layer.")

    # =========================================================================
    # SLIDE 15: ERD - Diagram 8: Database Integrity & Transaction Design
    # =========================================================================
    s15 = prs.slides.add_slide(blank_layout)
    apply_light_bg(s15)
    add_header(s15, "SECTION 3: ER DIAGRAM & DATABASE DESIGN", "Diagram 8: Database Integrity & Transactional Design", "Protecting against concurrency race conditions, rounding errors, and partial writes.")
    add_footer(s15, 15)

    integrity_pillars = [
        ("Pessimistic Write Locking", "PESSIMISTIC_WRITE (SELECT FOR UPDATE)",
         [
             "When a salary revision starts, employeeRepository.findByIdForUpdate(id) acquires a row-level lock in PostgreSQL.",
             "Prevents concurrent race conditions where two HR managers attempt to revise the same employee's salary simultaneously.",
             "Subsequent transactions wait or fail fast with conflict exceptions."
         ], COLOR_BLUE),
        ("Atomic Audit Logging", "Single Database Transaction Boundary",
         [
             "Both compensation slicing/insertion and salary_audit_logs insertion execute within the same @Transactional boundary.",
             "Zero partial writes: if an audit insert fails, the compensation change is completely rolled back.",
             "Guarantees that every salary record has a corresponding immutable audit trail."
         ], COLOR_GREEN),
        ("Exact Financial Precision", "DECIMAL(15,4) vs IEEE-754 Floats",
         [
             "Floating-point numbers (float/double) represent decimal fractions as binary approximations, leading to rounding drift (e.g. 0.1 + 0.2 = 0.30000000000000004).",
             "CompensationOS strictly uses Java BigDecimal and SQL DECIMAL(15,4).",
             "Eliminates penny rounding errors across millions of payroll calculations."
         ], COLOR_RED),
        ("Hibernate ActionQueue Sync", "saveAndFlush() Ordering Defense",
         [
             "Hibernate's ActionQueue natively executes all EntityInsertActions BEFORE EntityUpdateActions.",
             "Without intervention, inserting a new record before updating the old closed record triggers the PostgreSQL btree_gist exclusion error.",
             "Calling saveAndFlush() forces the SQL UPDATE immediately before the INSERT."
         ], COLOR_PURPLE)
    ]

    for idx, (p_title, p_sub, p_bullets, p_col) in enumerate(integrity_pillars):
        c_left = Inches(0.8) + (idx % 2) * (Inches(5.7) + Inches(0.33))
        c_top = Inches(1.8) + (idx // 2) * (Inches(2.35) + Inches(0.2))
        add_bullet_card(s15, c_left, c_top, Inches(5.7), Inches(2.35), f"{p_title} — {p_sub}", p_bullets, accent_color=p_col)

    set_notes(s15, "Here we highlight our four pillars of database integrity. First, pessimistic write locking prevents race conditions. Second, atomic transactions ensure compensation updates and audit logs are committed together. Third, DECIMAL(15,4) prevents float rounding drift. Fourth, our saveAndFlush() pattern overcomes Hibernate's default ActionQueue ordering, preventing false-positive btree_gist collisions.")

    # =========================================================================
    # SLIDE 16: ERD - Indexing & High-Performance Optimization
    # =========================================================================
    s16 = prs.slides.add_slide(blank_layout)
    apply_light_bg(s16)
    add_header(s16, "SECTION 3: ER DIAGRAM & DATABASE DESIGN", "Database Indexing & High-Performance Optimization", "Strategic composite and partial B-Tree indexes delivering sub-millisecond query execution.")
    add_footer(s16, 16)

    headers_idx = ["Index Name", "Target Table", "Indexed Columns & Predicate", "Target Query & SLA"]
    data_idx = [
        ["idx_emp_composite_filter", "employees", "(country, department, employment_status)", "Directory faceted search; accelerates filtered employee pagination to < 20ms."],
        ["idx_emp_code_search", "employees", "LOWER(employee_code), LOWER(email)", "Instant employee lookup by code or email; sub-1ms unique index scan."],
        ["idx_comp_emp_timeline", "compensation", "(employee_id, effective_from DESC)", "Historical salary timeline; retrieves complete employee revision history in < 2ms."],
        ["no_overlapping_ranges", "compensation", "GiST (employee_id, daterange)", "Temporal exclusion constraint; validates non-overlap on revision insert in < 1ms."],
        ["idx_comp_active_partial", "compensation", "(employee_id) WHERE effective_to IS NULL", "Partial index for active compensation lookup; eliminates table scan over historical rows."],
        ["idx_audit_emp_timestamp", "salary_audit_logs", "(employee_id, changed_at DESC)", "Audit history explorer; loads chronologically sorted change logs in < 5ms."]
    ]
    col_w_idx = [Inches(2.4), Inches(1.6), Inches(4.3), Inches(3.433)]
    add_table(s16, Inches(0.8), Inches(1.8), Inches(11.733), Inches(4.8), headers_idx, data_idx, col_w_idx)

    set_notes(s16, "To achieve sub-50ms query latency across 10,000 employees and 13,000+ compensation records, we created targeted composite and partial indexes. Note especially idx_comp_active_partial: because 30% of employees have historical revisions, a partial index where effective_to IS NULL allows PostgreSQL to index only the 10,000 currently active rows, drastically shrinking index size and query latency.")

    # =========================================================================
    # SLIDE 17: API - Diagram 9: REST API Architecture & Contracts
    # =========================================================================
    s17 = prs.slides.add_slide(blank_layout)
    apply_light_bg(s17)
    add_header(s17, "SECTION 4: API CONTRACTS & BACKEND DESIGN", "Diagram 9: REST API Architecture & OpenAPI Contracts", "Standardized RESTful endpoints documented via OpenAPI 3.0 / Swagger.")
    add_footer(s17, 17)

    headers_api = ["Module", "HTTP Method & Endpoint", "Purpose & Query Parameters", "Success Code"]
    data_api = [
        ["Auth", "POST /api/v1/auth/login", "Authenticates user credentials; returns JWT bearer token & role.", "200 OK"],
        ["Auth", "GET /api/v1/auth/me", "Retrieves current authenticated user profile & permissions.", "200 OK"],
        ["Employee", "GET /api/v1/employees", "Paginated directory search (search, country, department, status, page, size).", "200 OK"],
        ["Employee", "GET /api/v1/employees/{id}", "Retrieves full employee profile with active compensation.", "200 OK"],
        ["Employee", "GET /api/v1/employees/export", "Streams formula-sanitized CSV export of filtered employee directory.", "200 OK (text/csv)"],
        ["Compensation", "POST /api/v1/employees/{id}/compensation", "Submits an effective-dated salary revision; creates atomic audit log.", "201 Created"],
        ["Compensation", "GET /api/v1/employees/{id}/salary-history", "Retrieves complete chronological revision timeline with delta percentages.", "200 OK"],
        ["Analytics", "GET /api/v1/analytics/overview", "Macro KPIs across all 5 currencies (headcount, payroll sums, averages).", "200 OK"],
        ["Analytics", "GET /api/v1/analytics/departments?currency=USD", "Department statistics with PostgreSQL PERCENTILE_CONT(0.5) medians.", "200 OK"],
        ["Audit", "GET /api/v1/audit-logs", "Retrieves paginated immutable salary change audit records.", "200 OK"]
    ]
    col_w_api = [Inches(1.5), Inches(3.8), Inches(5.0), Inches(1.433)]
    add_table(s17, Inches(0.8), Inches(1.8), Inches(11.733), Inches(4.8), headers_api, data_api, col_w_api)

    set_notes(s17, "Our REST API is designed following strict RESTful principles, documented via OpenAPI 3 at /swagger-ui.html. Endpoints use standard HTTP verbs: GET for idempotent reads, POST for creation and revisions. Notice the separation of concerns: employee directory, compensation revisions, analytics, and audit logs each have dedicated, secured endpoints.")

    # =========================================================================
    # SLIDE 18: API - Representative Request & Response Payloads
    # =========================================================================
    s18 = prs.slides.add_slide(blank_layout)
    apply_light_bg(s18)
    add_header(s18, "SECTION 4: API CONTRACTS & BACKEND DESIGN", "Representative Request & Response Payloads", "Strictly typed JSON contracts ensuring frontend-backend payload alignment.")
    add_footer(s18, 18)

    # 4 JSON Code Cards
    json_cards = [
        ("POST /api/v1/auth/login",
         "{\n  \"email\": \"hrmanager@acme.com\",\n  \"password\": \"Manager@123\"\n}\n\n// Response 200 OK:\n{\n  \"token\": \"eyJhbGciOi...\",\n  \"type\": \"Bearer\",\n  \"userId\": 2,\n  \"email\": \"hrmanager@acme.com\",\n  \"role\": \"ROLE_HR_MANAGER\"\n}"),
        ("POST /api/v1/employees/{id}/compensation",
         "{\n  \"newBaseSalary\": 135000.00,\n  \"newBonus\": 20000.00,\n  \"currency\": \"USD\",\n  \"effectiveFrom\": \"2026-11-01\",\n  \"reason\": \"Annual Merit & Promotion\"\n}\n\n// Response 201 Created:\n{\n  \"id\": 14201,\n  \"employeeId\": 500,\n  \"baseSalary\": 135000.0000,\n  \"bonus\": 20000.0000,\n  \"currency\": \"USD\",\n  \"effectiveFrom\": \"2026-11-01\",\n  \"effectiveTo\": null\n}"),
        ("GET /api/v1/employees/500",
         "{\n  \"id\": 500,\n  \"employeeCode\": \"EMP-00500\",\n  \"fullName\": \"Sarah Jenkins\",\n  \"email\": \"sjenkins@acme.com\",\n  \"country\": \"USA\",\n  \"department\": \"Engineering\",\n  \"designation\": \"Staff Software Engineer\",\n  \"employmentStatus\": \"ACTIVE\",\n  \"baseSalary\": 120000.0000,\n  \"bonus\": 15000.0000,\n  \"currency\": \"USD\"\n}"),
        ("GET /api/v1/analytics/overview",
         "{\n  \"totalEmployees\": 10000,\n  \"activeEmployees\": 9850,\n  \"currencySummaries\": [\n    {\n      \"currency\": \"USD\",\n      \"employeeCount\": 2500,\n      \"totalPayroll\": 312500000.00,\n      \"averageBaseSalary\": 125000.00,\n      \"minBaseSalary\": 60000.00,\n      \"maxBaseSalary\": 240000.00\n    }\n    // INR, EUR, GBP, AED summaries...\n  ]\n}")
    ]

    for idx, (req_title, req_json) in enumerate(json_cards):
        c_left = Inches(0.8) + (idx % 2) * (Inches(5.7) + Inches(0.33))
        c_top = Inches(1.8) + (idx // 2) * (Inches(2.35) + Inches(0.2))
        add_card(s18, c_left, c_top, Inches(5.7), Inches(2.35), bg_color=COLOR_CODE_BG, border_color=COLOR_NAVY)

        tb = s18.shapes.add_textbox(c_left + Inches(0.18), c_top + Inches(0.1), Inches(5.34), Inches(2.15))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        p1 = tf.paragraphs[0]
        p1.text = req_title
        p1.font.size = Pt(10)
        p1.font.bold = True
        p1.font.color.rgb = COLOR_BLUE

        p2 = tf.add_paragraph()
        p2.text = req_json
        p2.font.size = Pt(7.8)
        p2.font.color.rgb = COLOR_TEXT_DARK
        p2.space_before = Pt(3)

    set_notes(s18, "Here are representative JSON contracts. Notice how all monetary numbers are serialized as numeric decimals, ISO dates are formatted YYYY-MM-DD, and responses return complete DTO entities rather than raw database models. This ensures contract stability even if the underlying database schema evolves.")

    # =========================================================================
    # SLIDE 19: API - Diagram 10: Salary Revision Sequence Diagram
    # =========================================================================
    s19 = prs.slides.add_slide(blank_layout)
    apply_light_bg(s19)
    add_header(s19, "SECTION 4: API CONTRACTS & BACKEND DESIGN", "Diagram 10: Salary Revision Sequence Diagram", "13-step end-to-end transactional lifecycle from HTTP request to database commit.")
    add_footer(s19, 19)

    steps = [
        ("Step 1: HTTP POST", "HR Manager submits revision via React UI -> POST /employees/{id}/compensation with Bearer JWT."),
        ("Step 2: Security Intercept", "JwtAuthenticationFilter validates token; extracts authenticated username (hrmanager@acme.com)."),
        ("Step 3: Controller Invocation", "CompensationController receives ReviseCompensationRequest; delegates to CompensationService."),
        ("Step 4: Transaction Boundary", "CompensationService opens an atomic @Transactional database boundary."),
        ("Step 5: Pessimistic Lock", "EmployeeRepository executes SELECT ... FOR UPDATE, acquiring row-level write lock."),
        ("Step 6: Business Validation", "Validates employee is ACTIVE, revision date >= joining date, and no exact duplicate effective dates."),
        ("Step 7: Timeline Retrieval", "Fetches existing compensation records ordered chronologically by effectiveFrom."),
        ("Step 8: Close Prior Period", "Sets active record's effectiveTo = revisionDate - 1 day; executes saveAndFlush()."),
        ("Step 9: Insert New Revision", "Creates new CompensationEntity with effectiveFrom = revisionDate, effectiveTo = nextDate - 1 (or NULL)."),
        ("Step 10: Insert Audit Log", "AuditService inserts salary_audit_logs record with actor identity and before/after salary diff."),
        ("Step 11: btree_gist Check", "PostgreSQL storage engine verifies zero date overlaps across daterange exclusion index."),
        ("Step 12: Atomic Commit", "Transaction commits changes to both compensation and salary_audit_logs tables simultaneously."),
        ("Step 13: HTTP 201 Response", "Controller maps entity to CompensationResponse DTO and returns 201 Created to frontend.")
    ]

    col1_steps = steps[:7]
    col2_steps = steps[7:]

    add_bullet_card(s19, Inches(0.8), Inches(1.8), Inches(5.7), Inches(4.8),
        "Sequence: Steps 1 to 7 (Request to Validation)",
        [f"{s}: {d}" for s, d in col1_steps], accent_color=COLOR_BLUE)

    add_bullet_card(s19, Inches(6.83), Inches(1.8), Inches(5.7), Inches(4.8),
        "Sequence: Steps 8 to 13 (Persistence & Rollback Defense)",
        [f"{s}: {d}" for s, d in col2_steps] + [
            "",
            "Automated Rollback Scenarios:",
            "• If employee is TERMINATED -> 400 Bad Request.",
            "• If dates overlap -> PostgreSQL GiST aborts -> 409 Conflict.",
            "• If audit write fails -> Transaction rolls back salary revision."
        ], accent_color=COLOR_GREEN)

    set_notes(s19, "This sequence diagram details the entire lifecycle of a salary revision. Notice step 5: pessimistic write locking prevents two managers from editing the same employee simultaneously. Notice step 8: saveAndFlush() is called explicitly to update the closed record before the new insert. And notice step 10: audit logging happens inside the same transaction, guaranteeing zero orphaned salary records.")

    # =========================================================================
    # SLIDE 20: API - Diagram 11: Authentication & JWT Security Architecture
    # =========================================================================
    s20 = prs.slides.add_slide(blank_layout)
    apply_light_bg(s20)
    add_header(s20, "SECTION 4: API CONTRACTS & BACKEND DESIGN", "Diagram 11: Authentication & JWT Security Architecture", "Stateless cryptographic authentication and actor identity assurance.")
    add_footer(s20, 20)

    auth_cards = [
        ("1. Credential Verification", "BCrypt Password Hashing",
         [
             "Client submits email and password over HTTPS TLS.",
             "DaoAuthenticationProvider loads user record from users table.",
             "BCryptPasswordEncoder verifies password against salted hash (cost factor 10).",
             "Zero plaintext password exposure in memory or logs."
         ], COLOR_PURPLE),
        ("2. Token Generation", "Cryptographic HMAC-SHA384 JWT",
         [
             "JwtTokenProvider generates signed JWT containing sub (email), userId, and role.",
             "Token signed using 256-bit secret key (HS384 algorithm).",
             "Configured with 24-hour expiration window.",
             "Stateless: zero server-side session memory consumption."
         ], COLOR_BLUE),
        ("3. Request Authorization", "OncePerRequestFilter Inspection",
         [
             "JwtAuthenticationFilter intercepts incoming HTTP requests.",
             "Validates cryptographic signature, issuer, and expiration date.",
             "Populates Spring Security's SecurityContextHolder with user Authentication token.",
             "Configured permitAll() for ASYNC/FORWARD dispatcher types for CSV streams."
         ], COLOR_GREEN),
        ("4. Actor Identity Assurance", "Zero Client-Side Spoofing",
         [
             "Critical Rule: ChangedBy identity for salary audit logs is extracted exclusively from SecurityContextHolder.",
             "Clients cannot spoof actor identity via request body fields.",
             "Role-based method security: @PreAuthorize(\"hasRole('ADMIN')\") guards administrative seed routes."
         ], COLOR_RED)
    ]

    for idx, (a_title, a_sub, a_bullets, a_col) in enumerate(auth_cards):
        c_left = Inches(0.8) + (idx % 2) * (Inches(5.7) + Inches(0.33))
        c_top = Inches(1.8) + (idx // 2) * (Inches(2.35) + Inches(0.2))
        add_bullet_card(s20, c_left, c_top, Inches(5.7), Inches(2.35), f"{a_title} — {a_sub}", a_bullets, accent_color=a_col)

    set_notes(s20, "Security architecture in CompensationOS adheres to Zero Trust. Notice point 4: when recording an audit log, the system NEVER trusts identity fields sent in the HTTP request body. The actor's email is retrieved directly from the verified JWT in Spring Security's SecurityContextHolder. Client-side identity spoofing is mathematically impossible.")

    # =========================================================================
    # SLIDE 21: Logic - Diagram 12: Salary Revision Business Workflow
    # =========================================================================
    s21 = prs.slides.add_slide(blank_layout)
    apply_light_bg(s21)
    add_header(s21, "SECTION 5: BUSINESS LOGIC & ANALYTICS", "Diagram 12: Salary Revision Business Workflow", "State machine decision flow governing salary revisions, validation rules, and interval slicing.")
    add_footer(s21, 21)

    flow_steps = [
        ("Validation Gate 1", "Active Status Check", "Verify employee.getEmploymentStatus() == ACTIVE.\nIf Terminated, Resigned, or On Leave, abort immediately with ValidationException.", COLOR_RED),
        ("Validation Gate 2", "Joining Date Boundary", "Verify revision.effectiveFrom >= employee.getJoiningDate().\nPrevent backdating compensation prior to corporate hire date.", COLOR_AMBER),
        ("Validation Gate 3", "Exact Date Collision", "Verify no existing revision starts on effectiveFrom.\nIf collision detected, prompt user to select a different effective date.", COLOR_BLUE),
        ("Slicing Engine", "Encompassing Interval Search", "Locate existing active record where effectiveFrom <= D and (effectiveTo IS NULL or >= D).\nSlice prior period: effectiveTo = D - 1 day.", COLOR_PURPLE),
        ("ActionQueue Defense", "Immediate saveAndFlush()", "Execute saveAndFlush(closedRecord) to force SQL UPDATE to PostgreSQL before INSERT.\nPrevents btree_gist ActionQueue collision.", COLOR_GREEN),
        ("Atomic Persistence", "Revision & Audit Insert", "Insert new compensation record.\nInsert immutable salary_audit_logs row with diff snapshot.\nCommit transaction.", COLOR_NAVY)
    ]

    for idx, (s_title, s_sub, s_desc, s_col) in enumerate(flow_steps):
        c_left = Inches(0.8) + (idx % 3) * (Inches(3.7) + Inches(0.31))
        c_top = Inches(1.8) + (idx // 3) * (Inches(2.35) + Inches(0.2))
        add_card(s21, c_left, c_top, Inches(3.7), Inches(2.35))

        bar = s21.shapes.add_shape(MSO_SHAPE.RECTANGLE, c_left, c_top, Inches(3.7), Inches(0.08))
        bar.fill.solid()
        bar.fill.fore_color.rgb = s_col
        bar.line.color.rgb = s_col

        tb = s21.shapes.add_textbox(c_left + Inches(0.2), c_top + Inches(0.15), Inches(3.3), Inches(2.05))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        p1 = tf.paragraphs[0]
        p1.text = f"{s_title}: {s_sub}"
        p1.font.size = Pt(11)
        p1.font.bold = True
        p1.font.color.rgb = COLOR_NAVY

        p2 = tf.add_paragraph()
        p2.text = s_desc
        p2.font.size = Pt(9.5)
        p2.font.color.rgb = COLOR_TEXT_DARK
        p2.space_before = Pt(4)

    set_notes(s21, "This workflow diagram illustrates the decision tree executed by CompensationService. Every salary revision passes through three strict validation gates before the slicing engine engages. If any validation fails, the transaction is rejected cleanly before any database state is modified.")

    # =========================================================================
    # SLIDE 22: Logic - Diagram 13: Multi-Currency Analytics & Strict Isolation
    # =========================================================================
    s22 = prs.slides.add_slide(blank_layout)
    apply_light_bg(s22)
    add_header(s22, "SECTION 5: BUSINESS LOGIC & ANALYTICS", "Diagram 13: Multi-Currency Analytics & Strict Isolation", "Why cross-currency aggregation is mathematically invalid and how sovereign isolation is enforced.")
    add_footer(s22, 22)

    # Top Warning Card
    add_card(s22, Inches(0.8), Inches(1.8), Inches(11.733), Inches(1.1), bg_color=RGBColor(254, 242, 242), border_color=COLOR_RED)
    w_tb = s22.shapes.add_textbox(Inches(1.0), Inches(1.9), Inches(11.333), Inches(0.9))
    w_tf = w_tb.text_frame
    w_tf.word_wrap = True
    wp1 = w_tf.paragraphs[0]
    wp1.text = "THE MATHEMATICAL FALLACY OF DIRECT CURRENCY SUMMATION"
    wp1.font.size = Pt(10)
    wp1.font.bold = True
    wp1.font.color.rgb = COLOR_RED
    wp2 = w_tf.add_paragraph()
    wp2.text = "Directly aggregating salaries across different sovereign currencies (e.g., adding ₹1,500,000 INR to $120,000 USD to €85,000 EUR) produces a meaningless number that corrupts executive compensation metrics. CompensationOS enforces strict sovereign isolation at both the domain entity and SQL query levels."
    wp2.font.size = Pt(9.5)
    wp2.font.color.rgb = COLOR_TEXT_DARK
    wp2.space_before = Pt(3)

    # 5 Sovereign Currency Cards
    currencies = [
        ("INR (India)", "3,500 Employees (35%)", "Total Payroll: ₹5.25 Billion\nAvg Base: ₹1,500,000\nMedian: ₹1,250,000\nMin: ₹450k | Max: ₹3.8M", COLOR_BLUE),
        ("USD (United States)", "2,500 Employees (25%)", "Total Payroll: $312.5 Million\nAvg Base: $125,000\nMedian: $120,000\nMin: $60k | Max: $240k", COLOR_GREEN),
        ("EUR (Germany)", "1,500 Employees (15%)", "Total Payroll: €127.5 Million\nAvg Base: €85,000\nMedian: €82,000\nMin: €45k | Max: €160k", COLOR_AMBER),
        ("GBP (United Kingdom)", "1,500 Employees (15%)", "Total Payroll: £135.0 Million\nAvg Base: £90,000\nMedian: £88,000\nMin: £48k | Max: €170k", COLOR_PURPLE),
        ("AED (United Arab Emirates)", "1,000 Employees (10%)", "Total Payroll: 330.0 Million AED\nAvg Base: 330,000 AED\nMedian: 320,000 AED\nMin: 180k | Max: 650k", COLOR_SKY)
    ]

    c_w5 = Inches(2.18)
    c_gap5 = Inches(0.2)
    for idx, (c_name, c_head, c_body, c_col) in enumerate(currencies):
        c_x = Inches(0.8) + idx * (c_w5 + c_gap5)
        add_card(s22, c_x, Inches(3.1), c_w5, Inches(2.6))

        bar = s22.shapes.add_shape(MSO_SHAPE.RECTANGLE, c_x, Inches(3.1), c_w5, Inches(0.08))
        bar.fill.solid()
        bar.fill.fore_color.rgb = c_col
        bar.line.color.rgb = c_col

        tb = s22.shapes.add_textbox(c_x + Inches(0.12), Inches(3.25), c_w5 - Inches(0.24), Inches(2.35))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        p1 = tf.paragraphs[0]
        p1.text = c_name
        p1.font.size = Pt(11)
        p1.font.bold = True
        p1.font.color.rgb = COLOR_NAVY

        p2 = tf.add_paragraph()
        p2.text = c_head
        p2.font.size = Pt(8.5)
        p2.font.bold = True
        p2.font.color.rgb = c_col
        p2.space_before = Pt(2)

        p3 = tf.add_paragraph()
        p3.text = c_body
        p3.font.size = Pt(8.5)
        p3.font.color.rgb = COLOR_TEXT_MUTED
        p3.space_before = Pt(4)

    # Domain Value Object Enforcement Banner
    add_card(s22, Inches(0.8), Inches(5.9), Inches(11.733), Inches(1.0), bg_color=RGBColor(241, 245, 249), border_color=COLOR_NAVY)
    vo_tb = s22.shapes.add_textbox(Inches(1.0), Inches(5.98), Inches(11.3), Inches(0.85))
    vo_tf = vo_tb.text_frame
    vo_tf.word_wrap = True
    vop1 = vo_tf.paragraphs[0]
    vop1.text = "DOMAIN ENFORCEMENT VIA VALUE OBJECT MONEY:"
    vop1.font.size = Pt(10)
    vop1.font.bold = True
    vop1.font.color.rgb = COLOR_NAVY
    vop2 = vo_tf.add_paragraph()
    vop2.text = "• Money.add(Money other): Checks if (!this.currency.equals(other.currency)) throw new CurrencyMismatchException().\n• Cross-currency operations without explicit exchange rate conversion are rejected at runtime in the domain layer."
    vop2.font.size = Pt(9)
    vop2.font.color.rgb = COLOR_TEXT_MUTED
    vop2.space_before = Pt(2)

    set_notes(s22, "This slide explains our multi-currency philosophy. In spreadsheets, people routinely sum columns containing different currencies, producing garbage totals. In CompensationOS, our domain value object Money throws a CurrencyMismatchException if an engineer attempts to add USD to INR. All analytics cards and SQL queries isolate currencies into sovereign buckets.")

    # =========================================================================
    # SLIDE 23: Logic - PostgreSQL Continuous Percentile Medians
    # =========================================================================
    s23 = prs.slides.add_slide(blank_layout)
    apply_light_bg(s23)
    add_header(s23, "SECTION 5: BUSINESS LOGIC & ANALYTICS", "PostgreSQL Continuous Percentile Medians", "Why continuous percentiles in SQL outperform application-layer calculations in accuracy and speed.")
    add_footer(s23, 23)

    add_bullet_card(s23, Inches(0.8), Inches(1.8), Inches(5.7), Inches(4.8),
        "Why True Median Over Arithmetic Mean?",
        [
            "Skewness Distortion: In corporate compensation, executive outlier salaries pull the arithmetic mean significantly higher than what 80% of staff earn.",
            "The True Median: The 50th percentile (P50) represents the exact midpoint where half of employees earn more and half earn less.",
            "PostgreSQL PERCENTILE_CONT(0.5): Computes continuous interpolated percentiles over ordered base salaries natively in C inside the PostgreSQL engine.",
            "Engine Efficiency: Executing medians in PostgreSQL eliminates transferring thousands of salary rows across the network to Spring Boot, slashing memory and query latency."
        ], accent_color=COLOR_PURPLE)

    # Right Card: SQL Query
    add_card(s23, Inches(6.83), Inches(1.8), Inches(5.7), Inches(4.8), bg_color=COLOR_CODE_BG, border_color=COLOR_NAVY)
    q_tb = s23.shapes.add_textbox(Inches(7.0), Inches(1.95), Inches(5.36), Inches(4.5))
    q_tf = q_tb.text_frame
    q_tf.word_wrap = True
    q_tf.margin_left = q_tf.margin_top = q_tf.margin_right = q_tf.margin_bottom = 0

    qp1 = q_tf.paragraphs[0]
    qp1.text = "NATIVE POSTGRESQL MEDIAN SQL QUERY:"
    qp1.font.size = Pt(10)
    qp1.font.bold = True
    qp1.font.color.rgb = COLOR_NAVY

    qp_code = q_tf.add_paragraph()
    qp_code.text = "SELECT \n    e.department AS department,\n    COUNT(e.id) AS employee_count,\n    ROUND(CAST(\n        PERCENTILE_CONT(0.5) WITHIN GROUP (\n            ORDER BY c.base_salary\n        ) AS NUMERIC\n    ), 2) AS median_base_salary,\n    ROUND(CAST(AVG(c.base_salary) AS NUMERIC), 2)\n        AS mean_base_salary,\n    MIN(c.base_salary) AS min_base_salary,\n    MAX(c.base_salary) AS max_base_salary\nFROM employee e\nJOIN compensation c ON e.id = c.employee_id\nWHERE c.currency = :currency\n  AND c.effective_from <= CURRENT_DATE\n  AND (c.effective_to IS NULL \n       OR c.effective_to >= CURRENT_DATE)\nGROUP BY e.department\nORDER BY e.department ASC;"
    qp_code.font.size = Pt(8.5)
    qp_code.font.color.rgb = COLOR_NAVY
    qp_code.space_before = Pt(4)

    set_notes(s23, "Here is the exact SQL query powering our department analytics. We use PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY c.base_salary). Notice that we filter only active compensation records where effective_from <= CURRENT_DATE and effective_to IS NULL or in the future. The database engine calculates the exact median in under 20 milliseconds across thousands of rows.")

    # =========================================================================
    # SLIDE 24: Demo - Diagram 14: Application Navigation & Screen Flow
    # =========================================================================
    s24 = prs.slides.add_slide(blank_layout)
    apply_light_bg(s24)
    add_header(s24, "SECTION 6: DEMO & USER INTERFACE", "Diagram 14: Application Navigation & Screen Flow", "Intuitive routing architecture and state hierarchy designed for high information density.")
    add_footer(s24, 24)

    nav_nodes = [
        ("1. /login", "Public Auth Screen", "User enters credentials -> Receives JWT bearer token -> Redirects to Dashboard.", COLOR_PURPLE),
        ("2. / (Dashboard)", "Executive KPI Dashboard", "Macro metrics across 10,000 employees, sovereign currency switcher, Recharts distributions.", COLOR_BLUE),
        ("3. /employees", "Employee Directory", "Debounced search bar, faceted filter drawer (Country, Dept, Role, Status), paginated table.", COLOR_SKY),
        ("4. /employees/:id", "Employee Profile", "Biographical overview, active compensation card, and chronological revision timeline.", COLOR_GREEN),
        ("5. Modal: Revise", "Salary Revision Modal", "Form inputs with real-time delta calculation (+$15k, +12.5%), effective date, and confirmation.", COLOR_AMBER),
        ("6. /analytics", "Analytics Explorer", "Sovereign currency drilldowns, department median bars, and interactive salary threshold tool.", COLOR_BLUE),
        ("7. /audit-logs", "Audit History Explorer", "Searchable changelog of all salary adjustments with actor identity, before/after diffs, and CSV export.", COLOR_NAVY)
    ]

    for idx, (n_route, n_title, n_desc, n_col) in enumerate(nav_nodes):
        if idx < 4:
            c_left = Inches(0.8) + idx * (Inches(2.78) + Inches(0.2))
            c_top = Inches(1.8)
            c_w = Inches(2.78)
            c_h = Inches(2.2)
        else:
            c_left = Inches(0.8) + (idx - 4) * (Inches(3.7) + Inches(0.31))
            c_top = Inches(4.3)
            c_w = Inches(3.7)
            c_h = Inches(2.4)

        add_card(s24, c_left, c_top, c_w, c_h)
        bar = s24.shapes.add_shape(MSO_SHAPE.RECTANGLE, c_left, c_top, c_w, Inches(0.08))
        bar.fill.solid()
        bar.fill.fore_color.rgb = n_col
        bar.line.color.rgb = n_col

        tb = s24.shapes.add_textbox(c_left + Inches(0.15), c_top + Inches(0.12), c_w - Inches(0.3), c_h - Inches(0.2))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        p1 = tf.paragraphs[0]
        p1.text = n_route
        p1.font.size = Pt(10)
        p1.font.bold = True
        p1.font.color.rgb = n_col

        p2 = tf.add_paragraph()
        p2.text = n_title
        p2.font.size = Pt(11)
        p2.font.bold = True
        p2.font.color.rgb = COLOR_NAVY
        p2.space_before = Pt(2)

        p3 = tf.add_paragraph()
        p3.text = n_desc
        p3.font.size = Pt(8.5)
        p3.font.color.rgb = COLOR_TEXT_MUTED
        p3.space_before = Pt(3)

    set_notes(s24, "This screen flow diagram maps out our frontend routing. Protected routes are wrapped in an AppLayout component containing a responsive sidebar, header with user session details, and instant navigation. TanStack Query caches API responses so navigating between directory, profile, and analytics is instantaneous without redundant network round trips.")

    # =========================================================================
    # SLIDE 25: Demo - SaaS Interface Mockups: Dashboard & Directory
    # =========================================================================
    s25 = prs.slides.add_slide(blank_layout)
    apply_light_bg(s25)
    add_header(s25, "SECTION 6: DEMO & USER INTERFACE", "SaaS Interface: Executive Dashboard & Directory", "Enterprise UI designed with Tailwind CSS, Lucide icons, and TanStack Query.")
    add_footer(s25, 25)

    add_bullet_card(s25, Inches(0.8), Inches(1.8), Inches(5.7), Inches(4.8),
        "Screen 1: Executive Dashboard (Mockup Details)",
        [
            "Top KPI Stat Cards: Total Headcount (10,000), Active Employees (9,850), Revisions This Year (3,728), Global Jurisdictions (5).",
            "Multi-Currency Selector Pills: Toggle between USD ($), INR (₹), EUR (€), GBP (£), and AED (د.إ) with instant card updates.",
            "Visual Recharts Components:",
            "• Headcount by Department Bar Chart (Engineering: 3,800, Product: 2,100, Operations: 1,800, Finance: 1,200, HR: 1,100).",
            "• Global Country Distribution Doughnut Chart (India 35%, USA 25%, Germany 15%, UK 15%, UAE 10%).",
            "Business Value: Gives executive leadership real-time visibility into compensation health without waiting for manual Excel consolidation."
        ], accent_color=COLOR_BLUE)

    add_bullet_card(s25, Inches(6.83), Inches(1.8), Inches(5.7), Inches(4.8),
        "Screen 2: Employee Directory (Mockup Details)",
        [
            "Debounced Instant Search: Filters across 10,000 records by employee name, code (EMP-00101), or corporate email with sub-50ms latency.",
            "Faceted Filter Controls: Multi-select dropdowns for Country (India, USA, etc.), Department, Designation, and Employment Status.",
            "High-Density Data Table: Displays Employee Code, Full Name, Department, Country Flag, Status Badge (ACTIVE, RESIGNED), Base Salary, and Bonus.",
            "One-Click CSV Export: Streams filtered records with formula injection sanitization.",
            "Server-Side Pagination: Clean page navigation (20 / 50 / 100 rows per page) with total count indicators."
        ], accent_color=COLOR_GREEN)

    set_notes(s25, "Here we detail the visual layout of our first two primary screens. The Dashboard provides macro-level KPIs and Recharts visualizations that dynamically adapt as you toggle currencies. The Employee Directory provides faceted filtering and instant search across the full 10,000 employee population with sub-50ms response times.")

    # =========================================================================
    # SLIDE 26: Demo - SaaS Interface Mockups: Profile, Revision Modal & Analytics
    # =========================================================================
    s26 = prs.slides.add_slide(blank_layout)
    apply_light_bg(s26)
    add_header(s26, "SECTION 6: DEMO & USER INTERFACE", "SaaS Interface: Profile, Revision Modal & Analytics", "Interactive salary revision with live delta previews and statistical analytics.")
    add_footer(s26, 26)

    add_bullet_card(s26, Inches(0.8), Inches(1.8), Inches(5.7), Inches(4.8),
        "Screen 3 & 4: Profile & Salary Revision Modal",
        [
            "Employee Profile Screen:",
            "• Personal Details Card: Code, Email, Phone, Country, Department, Status.",
            "• Current Compensation Card: Base Salary ($120,000), Bonus ($15,000), Currency.",
            "• Historical Timeline Cards: Chronological revision history with status badges (CURRENT, HISTORICAL, FUTURE).",
            "",
            "Salary Revision Workflow Modal:",
            "• Input Fields: New Base Salary, New Bonus, Effective Date, Reason.",
            "• Live Delta Preview Calculator: Automatically displays base salary delta (+$15,000 / +12.5%) and total comp change as the user types.",
            "• Validation Feedback: Warns if effective date collides with an existing revision or precedes employee joining date."
        ], accent_color=COLOR_AMBER)

    add_bullet_card(s26, Inches(6.83), Inches(1.8), Inches(5.7), Inches(4.8),
        "Screen 5 & 6: Analytics Explorer & Audit Trail",
        [
            "Analytics Explorer Screen:",
            "• Department Median Comparison: Recharts bar chart showing PostgreSQL PERCENTILE_CONT(0.5) medians across departments.",
            "• Dynamic Salary Threshold Tool: Interactive slider allowing executives to query: \"How many engineers earn > $130,000 in the US?\"",
            "• Salary Band Histogram: Distribution curves highlighting comp clusters.",
            "",
            "Audit Trail Explorer Screen:",
            "• Searchable log of every compensation adjustment in corporate history.",
            "• Diff Viewer: Shows Old Base vs. New Base and Old Bonus vs. New Bonus.",
            "• Identity & Timestamp: Displays authenticated user email and ISO timestamp."
        ], accent_color=COLOR_PURPLE)

    set_notes(s26, "These mockups highlight our core workflow screens. Notice the Salary Revision Modal: as Elena types a new salary, the live delta calculator immediately shows +$15,000 (+12.5%). This prevents typing errors before submission. In the Analytics Explorer, executives can drag the threshold slider to see how many staff earn above any compensation cutoff.")

    # =========================================================================
    # SLIDE 27: Demo - Live Product Demonstration Walkthrough Script
    # =========================================================================
    s27 = prs.slides.add_slide(blank_layout)
    apply_light_bg(s27)
    add_header(s27, "SECTION 6: DEMO & USER INTERFACE", "Live Product Demonstration Walkthrough Script", "5–7 minute evaluation script for senior engineering review and stakeholder demo.")
    add_footer(s27, 27)

    demo_steps = [
        ("Step 1: Login & Authentication (0:00 - 0:45)", "Navigate to http://localhost:5173. Login as hrmanager@acme.com / Manager@123. Demonstrate JWT issuance, role badge, and session bootstrap."),
        ("Step 2: Executive Dashboard (0:45 - 1:30)", "Observe 10,000 total headcount. Toggle currency selector to USD ($), then INR (₹). Point out that totals never mix currencies and Recharts adjust instantly."),
        ("Step 3: Employee Search & Filter (1:30 - 2:30)", "Go to /employees. Type Sharma into search (results in <50ms). Filter by India and Engineering. Click 'Export CSV' to show streaming download."),
        ("Step 4: Profile & Live Revision (2:30 - 4:00)", "Open employee #500. Review active salary. Click 'Revise Salary'. Enter $135,000 base, $20,000 bonus, effective 2026-11-01. Observe real-time +12.5% delta calculation."),
        ("Step 5: Verify Slicing & Audit (4:00 - 5:15)", "Click Submit. Profile refreshes immediately showing new record. Timeline displays old record closed. Go to /audit-logs and verify the new immutable entry."),
        ("Step 6: Analytics & Thresholds (5:15 - 6:30)", "Go to /analytics. Review department medians computed via PostgreSQL. Move the threshold slider to $120,000 and view headcount count.")
    ]

    add_bullet_card(s27, Inches(0.8), Inches(1.8), Inches(11.733), Inches(4.8),
        "Step-by-Step Live Demonstration Script (Credentials: hrmanager@acme.com / Manager@123)",
        [f"{title}\n   • {desc}" for title, desc in demo_steps], accent_color=COLOR_BLUE)

    set_notes(s27, "This 6-step demo script is structured for evaluators. It takes approximately 6 minutes and touches every technical capability: JWT authentication, multi-currency isolation, sub-50ms search, live revision with real-time delta preview, temporal timeline slicing, atomic audit logging, and PostgreSQL median projections.")

    # =========================================================================
    # SLIDE 28: QA - Diagram 15: Testing Pyramid & Quality Gates
    # =========================================================================
    s28 = prs.slides.add_slide(blank_layout)
    apply_light_bg(s28)
    add_header(s28, "SECTION 7: TESTING, QUALITY & PERFORMANCE", "Diagram 15: Testing Pyramid & Quality Gates", "Multi-layered automated testing pyramid ensuring functional, architectural, and regression defense.")
    add_footer(s28, 28)

    test_tiers = [
        ("End-to-End Integration Tests", "EndToEndIntegrationTest.java (1 Test)",
         [
             "Simulates full user workflow against live Spring Boot server & PostgreSQL 16.",
             "Executes: HR Login -> Search -> Salary Revision -> Timeline Slicing -> Analytics Medians -> CSV Export.",
             "Verifies entire HTTP request-response pipeline."
         ], COLOR_PURPLE),
        ("ArchUnit Architecture Tests", "ArchitectureTest.java (5 Rules)",
         [
             "Statically verifies Clean Architecture rules on every Maven build.",
             "Rules: Domain has zero dependencies; services access repositories via ports; no circular package dependencies.",
             "Guarantees architectural integrity cannot degrade over time."
         ], COLOR_BLUE),
        ("Application Service Unit Tests", "CompensationServiceTest, AnalyticsServiceTest (10 Tests)",
         [
             "Tests business logic, date overlap rejection, and adjacent period slicing.",
             "Verifies CurrencyMismatchException on cross-currency additions.",
             "Mockito unit tests execute in < 1 second."
         ], COLOR_GREEN),
        ("Data Seeding Verification", "SeedDataServiceTest, SeedDataVerificationTest (4 Tests)",
         [
             "Verifies exact 10,000 employee generation and 5-country distribution.",
             "Validates ~30% multi-revision histories and audit records."
         ], COLOR_AMBER),
        ("Domain Value Object Tests", "MoneyTest.java (4 Tests)",
         [
             "Verifies immutable Money arithmetic, currency equality, and precision scaling.",
             "Unit tests execute in 0.009s."
         ], COLOR_RED)
    ]

    t_top = Inches(1.8)
    t_h = Inches(0.92)
    t_gap = Inches(0.08)
    for idx, (title, sub, bullets, color) in enumerate(test_tiers):
        c_y = t_top + idx * (t_h + t_gap)
        card = add_card(s28, Inches(0.8), c_y, Inches(11.733), t_h)
        bar = s28.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), c_y, Inches(0.1), t_h)
        bar.fill.solid()
        bar.fill.fore_color.rgb = color
        bar.line.color.rgb = color

        tb = s28.shapes.add_textbox(Inches(1.05), c_y + Inches(0.08), Inches(11.3), t_h - Inches(0.16))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        p1 = tf.paragraphs[0]
        p1.text = f"{title.upper()}  —  {sub}"
        p1.font.size = Pt(11)
        p1.font.bold = True
        p1.font.color.rgb = COLOR_NAVY

        p2 = tf.add_paragraph()
        p2.text = " • ".join(bullets)
        p2.font.size = Pt(9)
        p2.font.color.rgb = COLOR_TEXT_MUTED
        p2.space_before = Pt(2)

    set_notes(s28, "Our testing strategy covers the entire pyramid. At the top, EndToEndIntegrationTest runs a full HTTP workflow against a real PostgreSQL 16 container. In the middle, ArchUnit tests statically verify our Clean Architecture rules. At the base, unit tests verify domain invariants. Total: 23 backend tests, 0 failures, 0 skipped.")

    # =========================================================================
    # SLIDE 29: QA - Diagram 16: High-Performance 10,000 Employee Seed Engine
    # =========================================================================
    s29 = prs.slides.add_slide(blank_layout)
    apply_light_bg(s29)
    add_header(s29, "SECTION 7: TESTING, QUALITY & PERFORMANCE", "Diagram 16: High-Performance 10k Seed Engine", "Populating 10,000 employees, 13,728 compensation records, and 3,728 audit logs in < 3.5s.")
    add_footer(s29, 29)

    add_bullet_card(s29, Inches(0.8), Inches(1.8), Inches(5.7), Inches(4.8),
        "High-Performance Batch Seeding Mechanics",
        [
            "Deterministic Pseudo-Random Generation: SeedDataService uses java.util.Random(42L) to generate identical, reproducible datasets across all environments.",
            "JDBC Batch Insert Optimization: Bypasses Hibernate entity lifecycle overhead by using JdbcTemplate.batchUpdate() with a batchSize of 2,000 records.",
            "Blazing Speed: Seeds 10,000 employees, 13,728 compensation records, and 3,728 audit logs in approximately 3.4 seconds.",
            "Historical Salary Revisions (~30%): Deterministically generates 3,728 historical salary revisions with closed dates and corresponding audit records.",
            "Startup Integration: SeedRunner checks if employee count == 0 on application startup and seeds automatically if empty."
        ], accent_color=COLOR_GREEN)

    headers_seed = ["Country", "Employees", "Currency", "Departments", "Sample Designations"]
    data_seed = [
        ["India", "3,500 (35%)", "INR (₹)", "Eng, Prod, HR, Fin, Ops", "Senior SDE, Tech Lead, Staff SDE"],
        ["United States", "2,500 (25%)", "USD ($)", "Eng, Prod, HR, Fin, Ops", "Principal Architect, VP Eng"],
        ["Germany", "1,500 (15%)", "EUR (€)", "Eng, Prod, HR, Fin, Ops", "Senior DevOps, Engineering Mgr"],
        ["United Kingdom", "1,500 (15%)", "GBP (£)", "Eng, Prod, HR, Fin, Ops", "Senior Engineer, Staff PM"],
        ["UAE", "1,000 (10%)", "AED (د.إ)", "Eng, Prod, HR, Fin, Ops", "VP Engineering, Director"],
        ["Total", "10,000", "5 Currencies", "5 Core Depts", "13,728 Comp Records Seeded"]
    ]
    col_w_seed = [Inches(1.4), Inches(1.3), Inches(1.1), Inches(1.4), Inches(1.5)]
    add_table(s29, Inches(6.83), Inches(1.8), Inches(5.7), Inches(4.8), headers_seed, data_seed, col_w_seed)

    set_notes(s29, "How did we achieve seeding 10,000 employees in 3.4 seconds? JPA saveAll() takes over 45 seconds because Hibernate inspects every entity. We used JDBC batch updates with a batch size of 2,000. Using Random(42L) ensures the 5-country distribution and ~30% historical revisions are 100% deterministic and reproducible.")

    # =========================================================================
    # SLIDE 30: QA - Security Hardening & Formula Injection Sanitization
    # =========================================================================
    s30 = prs.slides.add_slide(blank_layout)
    apply_light_bg(s30)
    add_header(s30, "SECTION 7: TESTING, QUALITY & PERFORMANCE", "Security Hardening & Formula Injection Sanitization", "Hardening CSV exports and securing APIs against OWASP Top 10 vulnerabilities.")
    add_footer(s30, 30)

    sec_cards = [
        ("Spreadsheet Formula Injection Defense", "CsvSanitizer.java Defense",
         [
             "Vulnerability: Attackers inject malicious formulas (=CMD|'/C calc'!A0, +@SUM...) into text fields that execute when an executive opens the CSV in Excel.",
             "Sanitization Algorithm: CsvSanitizer inspects all string fields. If a value begins with =, +, -, @, \\t, or \\r, it automatically prepends a single quote (').",
             "Result: Excel treats the cell strictly as harmless plain text."
         ], COLOR_RED),
        ("Authentication & Access Defense", "Spring Security 6 & JJWT",
         [
             "Stateless JWT tokens prevent session fixation and CSRF vulnerabilities.",
             "BCrypt hashing prevents password exposure in database dumps.",
             "Method-level security: @PreAuthorize restricts salary revision execution exclusively to HR_MANAGER and ADMIN roles.",
             "Permitted ASYNC dispatcher types allow streaming non-blocking CSVs."
         ], COLOR_BLUE),
        ("SQL Injection & ORM Defense", "Spring Data JPA & Parameterized SQL",
         [
             "All database queries use parameterized CriteriaBuilder specifications or named parameters.",
             "Zero dynamic string concatenation in SQL queries.",
             "PostgreSQL engine rejects SQL syntax injection attempts."
         ], COLOR_GREEN),
        ("Data Immutability & Audit Defense", "Write-Only Compliance Log",
         [
             "Audit records are write-only. Zero HTTP PUT or DELETE routes exist.",
             "Foreign key constraints on employee_id prevent orphaned audit rows.",
             "Atomic transactions guarantee audit logs cannot be decoupled from revisions."
         ], COLOR_PURPLE)
    ]

    for idx, (s_title, s_sub, s_bullets, s_col) in enumerate(sec_cards):
        c_left = Inches(0.8) + (idx % 2) * (Inches(5.7) + Inches(0.33))
        c_top = Inches(1.8) + (idx // 2) * (Inches(2.35) + Inches(0.2))
        add_bullet_card(s30, c_left, c_top, Inches(5.7), Inches(2.35), f"{s_title} — {s_sub}", s_bullets, accent_color=s_col)

    set_notes(s30, "Security hardening in enterprise compensation requires addressing unconventional attack vectors. Most developers forget that CSV exports can execute arbitrary shell commands via Excel DDE injection if an employee name starts with '=' or '@'. Our CsvSanitizer neutralizes every single cell. Combined with BCrypt, stateless JWT, and parameterized SQL, the platform is thoroughly hardened.")

    # =========================================================================
    # SLIDE 31: Microservices - Diagram 17: Future Microservice Extraction Blueprint
    # =========================================================================
    s31 = prs.slides.add_slide(blank_layout)
    apply_light_bg(s31)
    add_header(s31, "SECTION 8: MICROSERVICE READINESS & FUTURE EVOLUTION", "Diagram 17: Future Microservice Extraction Blueprint", "How Clean Architecture interfaces enable zero-downtime microservice extraction when scale demands.")
    add_footer(s31, 31)

    future_services = [
        ("Employee Service", "Database: employee_db", "Owns employee registration, personal records, and employment status. Emits EmployeeCreated and EmployeeStatusChanged domain events.", COLOR_BLUE),
        ("Compensation Service", "Database: compensation_db", "Owns effective-dated revisions and btree_gist temporal tables. Listens to employee events; manages salary lifecycles.", COLOR_GREEN),
        ("Analytics Service", "Database: ClickHouse / Read DB", "Maintains CQRS denormalized read models for executive dashboards. Ingests events to provide real-time percentile medians.", COLOR_SKY),
        ("Audit Service", "Database: audit_db (WORM / S3)", "Write-once append-only event store. Subscribes to CompensationRevised events to persist immutable compliance records.", COLOR_AMBER)
    ]

    for idx, (s_name, s_db, s_desc, s_col) in enumerate(future_services):
        c_left = Inches(0.8) + idx * (Inches(2.78) + Inches(0.2))
        add_card(s31, c_left, Inches(1.8), Inches(2.78), Inches(2.7))
        bar = s31.shapes.add_shape(MSO_SHAPE.RECTANGLE, c_left, Inches(1.8), Inches(2.78), Inches(0.08))
        bar.fill.solid()
        bar.fill.fore_color.rgb = s_col
        bar.line.color.rgb = s_col

        tb = s31.shapes.add_textbox(c_left + Inches(0.15), Inches(1.95), Inches(2.48), Inches(2.4))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        p1 = tf.paragraphs[0]
        p1.text = s_name
        p1.font.size = Pt(11)
        p1.font.bold = True
        p1.font.color.rgb = COLOR_NAVY

        p2 = tf.add_paragraph()
        p2.text = s_db
        p2.font.size = Pt(9)
        p2.font.bold = True
        p2.font.color.rgb = s_col
        p2.space_before = Pt(2)

        p3 = tf.add_paragraph()
        p3.text = s_desc
        p3.font.size = Pt(8.5)
        p3.font.color.rgb = COLOR_TEXT_MUTED
        p3.space_before = Pt(4)

    # Bottom Event-Driven Architecture Banner
    add_bullet_card(s31, Inches(0.8), Inches(4.7), Inches(11.733), Inches(2.15),
        "Event-Driven Integration Architecture (Transactional Outbox Pattern)",
        [
            "Asynchronous Event Bus: Services integrate via Apache Kafka topics (e.g. employee.events, compensation.events).",
            "Transactional Outbox Pattern: Compensation Service writes the revision and an outbox event in the same local ACID transaction. A Debezium CDC or background relay publishes to Kafka, eliminating dual-write inconsistencies.",
            "Decoupled Databases: Each microservice possesses its own private database schema, eliminating shared database coupling.",
            "Current Clean Architecture Enablement: Because modules already communicate via Java Port interfaces, extracting them into network-boundary microservices requires swapping port adapters from local Java calls to HTTP/Kafka publishers."
        ], accent_color=COLOR_PURPLE)

    set_notes(s31, "While a modular monolith is optimal today, we have designed the platform to be microservice-ready. Notice how each module maps to a distinct bounded context. If ACME grows to 100,000 employees, we can extract the Compensation Service and Audit Service into standalone microservices using the Transactional Outbox pattern and Kafka, without rewriting core business logic.")

    # =========================================================================
    # SLIDE 32: Microservices - Monolith vs Microservices Trade-Offs
    # =========================================================================
    s32 = prs.slides.add_slide(blank_layout)
    apply_light_bg(s32)
    add_header(s32, "SECTION 8: MICROSERVICE READINESS & FUTURE EVOLUTION", "Architectural Trade-Offs: Monolith vs. Microservices", "Objective comparison of transactional guarantees, operational complexity, and performance.")
    add_footer(s32, 32)

    headers_to = ["Evaluation Dimension", "Modular Monolith (Current)", "Distributed Microservices (Future)", "Engineering Verdict"]
    data_to = [
        ["Data Consistency", "ACID Transactions: Guaranteed atomic commit across revision and audit tables.", "Eventual Consistency: Requires Saga pattern or 2-Phase Commit; risk of partial failure.", "Monolith wins decisively for audit & financial compliance."],
        ["Deployment Complexity", "Single Artifact: 1 Docker container for backend, 1 for frontend, 1 for PostgreSQL.", "High Complexity: Kubernetes clusters, service meshes (Istio), API gateways, distributed tracing.", "Monolith drastically reduces DevOps operational overhead."],
        ["Network Latency", "Sub-Millisecond: In-memory Java interface method calls execute in < 0.01ms.", "Network RPC Latency: HTTP/gRPC roundtrips introduce 5–20ms network overhead per hop.", "Monolith provides superior search and directory response times."],
        ["Database Foreign Keys", "Enforced: PostgreSQL validates relational integrity between employees and compensation.", "Soft References: Cross-service foreign keys cannot exist across separate databases.", "Monolith prevents orphaned compensation or audit records."],
        ["Team Scaling", "Requires ArchUnit discipline to prevent code entangling as teams grow.", "Decoupled releases allow separate engineering squads to deploy independently.", "Microservices win only when headcount exceeds 50+ engineers."]
    ]
    col_w_to = [Inches(2.0), Inches(3.2), Inches(3.4), Inches(3.133)]
    add_table(s32, Inches(0.8), Inches(1.8), Inches(11.733), Inches(4.8), headers_to, data_to, col_w_to)

    set_notes(s32, "This trade-off matrix proves why our decision to build a Modular Monolith was correct. In compensation systems, financial consistency is paramount. A monolith guarantees ACID transactions. In microservices, updating a salary and writing an audit log requires eventual consistency or distributed sagas. For ACME's current scale, the modular monolith is faster, cheaper, and safer.")

    # =========================================================================
    # SLIDE 33: Docs - Diagram 18: Technical Documentation Map
    # =========================================================================
    s33 = prs.slides.add_slide(blank_layout)
    apply_light_bg(s33)
    add_header(s33, "SECTION 9: TECHNICAL DOCUMENTATION & ROADMAP", "Diagram 18: Technical Documentation Map", "Comprehensive architectural repository structure ensuring transparency and onboarding velocity.")
    add_footer(s33, 33)

    docs_map = [
        ("README.md (Repository Root)", "Quickstart guide, system architecture diagrams, Docker Compose instructions, verified test suite results, and default login credentials."),
        ("docs/requirements.md (PRD)", "Complete functional specifications (FR-EMP, FR-CMP, FR-ANA, FR-AUD), non-functional requirements, and personas."),
        ("docs/architecture.md (HLD)", "System context diagrams, multi-tier architecture, module responsibilities, public port contracts, and modular monolith rules."),
        ("docs/database-design.md", "Relational ER diagram, table schemas, btree_gist exclusion constraints, composite indexes, and data precision standards."),
        ("docs/api-design.md", "REST API specifications, OpenAPI schemas, representative JSON request/response payloads, and error handling advice."),
        ("docs/testing-strategy.md", "Testing pyramid breakdown, ArchUnit boundary rules, EndToEndIntegrationTest details, and verification commands."),
        ("docs/trade-offs.md", "Deep architectural trade-off evaluations: Modular Monolith vs. Microservices, Flyway vs. Liquibase, React vs. SSR."),
        ("docs/ai-usage.md", "Transparent record of responsible AI-assisted engineering, prompt iterations, architecture review checklists, and human verifications.")
    ]

    d_w = Inches(5.7)
    d_h = Inches(1.08)
    for idx, (doc_name, doc_desc) in enumerate(docs_map):
        col_idx = idx // 4
        row_idx = idx % 4
        c_left = Inches(0.8) + col_idx * (d_w + Inches(0.33))
        c_top = Inches(1.8) + row_idx * (d_h + Inches(0.12))

        add_card(s33, c_left, c_top, d_w, d_h)
        bar = s33.shapes.add_shape(MSO_SHAPE.RECTANGLE, c_left, c_top, Inches(0.08), d_h)
        bar.fill.solid()
        bar.fill.fore_color.rgb = COLOR_BLUE
        bar.line.color.rgb = COLOR_BLUE

        tb = s33.shapes.add_textbox(c_left + Inches(0.18), c_top + Inches(0.08), d_w - Inches(0.3), d_h - Inches(0.16))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        p1 = tf.paragraphs[0]
        p1.text = doc_name
        p1.font.size = Pt(10.5)
        p1.font.bold = True
        p1.font.color.rgb = COLOR_NAVY

        p2 = tf.add_paragraph()
        p2.text = doc_desc
        p2.font.size = Pt(8.5)
        p2.font.color.rgb = COLOR_TEXT_MUTED
        p2.space_before = Pt(2)

    set_notes(s33, "A system is only as good as its documentation. In the docs/ directory, we have produced comprehensive architectural artifacts: requirements.md, architecture.md, database-design.md, api-design.md, testing-strategy.md, trade-offs.md, and ai-usage.md. Any engineer joining the team can understand the entire design in their first afternoon.")

    # =========================================================================
    # SLIDE 34: Docs - Diagram 19: 10-Phase Implementation Roadmap & Milestones
    # =========================================================================
    s34 = prs.slides.add_slide(blank_layout)
    apply_light_bg(s34)
    add_header(s34, "SECTION 9: TECHNICAL DOCUMENTATION & ROADMAP", "Diagram 19: 10-Phase Implementation Roadmap", "Chronological engineering execution milestones from initialization to containerized delivery.")
    add_footer(s34, 34)

    phases = [
        ("Phase 1: Foundation", "Project bootstrap, Maven multi-tier structure, and initial dependencies."),
        ("Phase 2: Database Schema", "Flyway migrations (V1, V2), btree_gist extension, relational tables."),
        ("Phase 3: Domain & Security", "Value object Money, JWT token provider, BCrypt, and ArchUnit rules."),
        ("Phase 4: Employee Module", "Employee CRUD, JPA adapter, Specifications, and streaming CSV export."),
        ("Phase 5: Compensation & Audit", "Temporal revision engine, saveAndFlush() defense, and atomic audit logging."),
        ("Phase 6: Multi-Currency Analytics", "Sovereign isolation, native PERCENTILE_CONT(0.5) PostgreSQL medians."),
        ("Phase 7: 10k Seed Engine", "Deterministic Random(42L) JDBC batch populator (3.4s execution)."),
        ("Phase 8: React SaaS Frontend", "Vite + Tailwind CSS UI, TanStack Query, Recharts, and revision modal."),
        ("Phase 9: Comprehensive Docs", "PRD, HLD, ERD, API specs, trade-offs, and evaluation guides."),
        ("Phase 10: Final Verification", "E2E integration test, full test suite (23/23 passing), Docker Compose.")
    ]

    p_w = Inches(2.18)
    p_h = Inches(2.25)
    for idx, (p_title, p_desc) in enumerate(phases):
        col_idx = idx % 5
        row_idx = idx // 5
        c_left = Inches(0.8) + col_idx * (p_w + Inches(0.2))
        c_top = Inches(1.8) + row_idx * (p_h + Inches(0.2))

        add_card(s34, c_left, c_top, p_w, p_h)
        bar = s34.shapes.add_shape(MSO_SHAPE.RECTANGLE, c_left, c_top, p_w, Inches(0.08))
        bar.fill.solid()
        bar.fill.fore_color.rgb = COLOR_GREEN if idx == 9 else COLOR_BLUE
        bar.line.color.rgb = COLOR_GREEN if idx == 9 else COLOR_BLUE

        tb = s34.shapes.add_textbox(c_left + Inches(0.12), c_top + Inches(0.12), p_w - Inches(0.24), p_h - Inches(0.2))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        p1 = tf.paragraphs[0]
        p1.text = p_title
        p1.font.size = Pt(10)
        p1.font.bold = True
        p1.font.color.rgb = COLOR_NAVY

        p2 = tf.add_paragraph()
        p2.text = p_desc
        p2.font.size = Pt(8.5)
        p2.font.color.rgb = COLOR_TEXT_MUTED
        p2.space_before = Pt(3)

        p3 = tf.add_paragraph()
        p3.text = "✓ VERIFIED"
        p3.font.size = Pt(8.5)
        p3.font.bold = True
        p3.font.color.rgb = COLOR_GREEN
        p3.space_before = Pt(4)

    set_notes(s34, "This roadmap depicts our structured 10-phase execution. We built the foundation first with database migrations and ArchUnit tests, implemented the employee and compensation domains, added multi-currency analytics and the 10k seed engine, constructed the React SaaS UI, and completed full end-to-end integration testing. Every single phase is verified and committed in git.")

    # =========================================================================
    # SLIDE 35: Final Review - Architecture Decision Summary & Conclusion
    # =========================================================================
    s35 = prs.slides.add_slide(blank_layout)
    bg35 = s35.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
    bg35.fill.solid()
    bg35.fill.fore_color.rgb = COLOR_BG_DARK
    bg35.line.color.rgb = COLOR_BG_DARK

    # Header
    add_header(s35, "EXECUTIVE ARCHITECTURE CONCLUSION", "ACME CompensationOS: Production-Ready Engineering", "A hardened, audit-grade platform engineered to scale with 100% data integrity.")
    add_footer(s35, 35)

    # 4 Core Achievement Cards
    achievements = [
        ("Zero-Gap Temporal Integrity", "PostgreSQL btree_gist exclusion constraints enforce overlap-free compensation dates at the database storage engine level.", COLOR_GREEN),
        ("ArchUnit Clean Architecture", "SOLID principles and hexagonal layer boundaries verified programmatically on every Maven build; zero package cycles.", COLOR_BLUE),
        ("Sovereign Multi-Currency", "Strict mathematical isolation across 5 currencies; high-precision native PostgreSQL continuous percentile medians.", COLOR_SKY),
        ("10,000 Deterministic Dataset", "High-performance JDBC batch engine seeds 10k employees, 13,728 revisions, and 3,728 audit logs in < 3.5 seconds.", COLOR_PURPLE)
    ]

    card_w35 = Inches(2.65)
    card_gap35 = Inches(0.24)
    start_x35 = Inches(1.0)
    for i, (head, sub, col) in enumerate(achievements):
        c_x = start_x35 + i * (card_w35 + card_gap35)
        c_shape = s35.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, c_x, Inches(2.0), card_w35, Inches(2.2))
        c_shape.fill.solid()
        c_shape.fill.fore_color.rgb = RGBColor(30, 41, 59)
        c_shape.line.color.rgb = col
        c_shape.line.width = Pt(1.5)
        c_tf = c_shape.text_frame
        c_tf.word_wrap = True
        c_tf.margin_top = Inches(0.2)
        cp1 = c_tf.paragraphs[0]
        cp1.text = head
        cp1.font.size = Pt(12)
        cp1.font.bold = True
        cp1.font.color.rgb = col
        cp2 = c_tf.add_paragraph()
        cp2.text = sub
        cp2.font.size = Pt(9.5)
        cp2.font.color.rgb = RGBColor(203, 213, 225)
        cp2.space_before = Pt(6)

    # Bottom Summary Box
    sum_box = s35.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.0), Inches(4.6), Inches(11.3), Inches(2.0))
    sum_box.fill.solid()
    sum_box.fill.fore_color.rgb = RGBColor(30, 41, 59)
    sum_box.line.color.rgb = COLOR_CARD_BORDER
    sum_tf = sum_box.text_frame
    sum_tf.word_wrap = True
    sum_tf.margin_top = Inches(0.2)

    sp1 = sum_tf.paragraphs[0]
    sp1.text = "FINAL VERDICT & PRODUCTION READINESS SCORECARD"
    sp1.font.size = Pt(11)
    sp1.font.bold = True
    sp1.font.color.rgb = COLOR_SKY

    sp2 = sum_tf.add_paragraph()
    sp2.text = "✓ 23/23 Automated Backend Tests Passed (ArchUnit, CompensationService, Analytics, Seed, Money, E2E).\n✓ Frontend compiled with zero TypeScript errors across 2,429 modules.\n✓ Docker Compose orchestration ready: Web UI on :80, API on :8080, PostgreSQL on :5432.\n✓ Live Platform Demo: http://localhost:5173  |  Swagger UI: http://localhost:8080/swagger-ui.html"
    sp2.font.size = Pt(10)
    sp2.font.color.rgb = RGBColor(255, 255, 255)
    sp2.space_before = Pt(6)

    set_notes(s35, "In conclusion, ACME CompensationOS successfully transforms a high-risk, spreadsheet-driven workflow into a production-grade, audit-compliant compensation platform. Every requirement—from btree_gist exclusion constraints to ArchUnit rules, multi-currency isolation, 10k batch seeding, and full-stack Docker orchestration—has been built, tested, and verified. Thank you for your review. We are ready for technical Q&A and live demonstration.")

    print("All 35 slides successfully built.")

    # Save presentation
    output_path = r"c:\projects\salary management system\ACME_CompensationOS_Architecture_Presentation.pptx"
    prs.save(output_path)
    print(f"Presentation saved to: {output_path}")
    return prs, output_path

if __name__ == "__main__":
    build_presentation()
