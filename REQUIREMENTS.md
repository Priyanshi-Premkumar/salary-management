# ACME CompensationOS: Requirements Specification

> **Document Identifier:** PRD-ACME-COMP-001  
> **Target Release:** Version 1.0.0 (Production Architecture)  
> **System Scope:** Global Employee Compensation Management (10,000+ Employees across 5 Jurisdictions)  
> **Canonical Document:** [`docs/requirements.md`](docs/requirements.md)

---

## Overview

The complete, exhaustive 7-domain Product Requirements Document (PRD) and Enterprise SLAs for **ACME CompensationOS** are maintained in the central architecture directory:

👉 **[Read the Full Product Requirements Document (docs/requirements.md)](docs/requirements.md)**

---

## Key Requirements Summary

### 1. Scope & Jurisdiction
- **Global Headcount:** 10,000+ full-time employees.
- **5 Sovereign Jurisdictions:** India (`INR` - ₹), USA (`USD` - $), Germany (`EUR` - €), UK (`GBP` - £), UAE (`AED` - د.إ).
- **Strict Currency Isolation:** Zero mixing of un-normalized currencies; sovereign isolation enforced at the domain value-object level (`Money`).

### 2. Core Functional Requirements
- **FR-EMP (Employee Management):** Complete employee directory, pagination, text search, and multi-faceted filtering.
- **FR-CMP (Compensation & Effective Dating):** Non-destructive salary revisions, zero-gap timelines, and concurrency locking.
- **FR-ANA (Statistical Analytics):** PostgreSQL native percentile medians via `PERCENTILE_CONT(0.5)`, department distributions, and threshold projections.
- **FR-AUD (Audit & Governance):** Append-only immutable audit trail capturing actor, timestamp, old/new base salary, bonus, and business reason.
- **FR-EXP (Streaming CSV Export):** Memory-efficient streaming export with automatic formula injection sanitization (`=`, `+`, `-`, `@` neutralized).
- **FR-SEC (Security & Access Control):** Stateless JWT authentication with role-based access control (`ROLE_ADMIN`, `ROLE_HR_MANAGER`, `ROLE_EXECUTIVE`).

### 3. Non-Functional SLAs
- **Search Latency:** P95 < 50ms across 10,000+ records.
- **Analytics Aggregation:** P95 < 100ms for multi-currency percentiles.
- **Data Integrity:** PostgreSQL 16 `btree_gist` exclusion constraints preventing overlapping effective date ranges at the database storage engine level.
- **Seed Engine:** Deterministic JDBC batch seeding of 10,000 employees in < 3.5 seconds.

---

## Documentation Navigation

| Document | Description |
| :--- | :--- |
| **[Product Requirements (PRD)](docs/requirements.md)** | Full functional matrix, edge cases, and compliance requirements |
| **[Project Overview](PROJECT_OVERVIEW.md)** | High-level system overview, problem statement, and tech stack |
| **[System Architecture](docs/architecture.md)** | Clean Architecture / Ports & Adapters and module interactions |
| **[Database Design](docs/database-design.md)** | Schema, `btree_gist` exclusion constraints, indexes, and migrations |
| **[API Design](docs/api-design.md)** | REST endpoints, OpenAPI 3 contracts, and error handling |
| **[Testing Strategy](docs/testing-strategy.md)** | Unit, ArchUnit, Testcontainers, and end-to-end integration tests |
| **[Architecture Presentation](docs/presentation.md)** | Slide-by-slide 35-slide technical presentation and speaker notes |
| **[Architecture Deck (.pptx)](ACME_CompensationOS_Architecture_Presentation.pptx)** | 16:9 widescreen editable PowerPoint presentation |
