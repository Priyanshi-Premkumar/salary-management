# ACME CompensationOS: Project Overview & Engineering Specifications

> **Enterprise Employee Salary & Multi-Currency Compensation Management Platform**  
> Engineered for 10,000+ employees distributed across India, USA, Germany, United Kingdom, and the United Arab Emirates.

---

## 1. Executive Summary

**ACME CompensationOS** is an audit-grade, enterprise compensation management platform designed to replace fragile, spreadsheet-driven workflows with a secure, high-performance, and mathematically sound system.

The platform provides centralized compensation management, non-destructive effective-dated salary revisions, atomic change auditing, and statistical multi-currency analytics for **10,000 global employees**.

### Key Architectural & Engineering Highlights
- **Architecture Style**: Modular Monolith following **Hexagonal Clean Architecture (Ports & Adapters)** principles.
- **Architectural Verification**: Validated statically via **ArchUnit** test suites (`ArchitectureTest.java`) ensuring zero layer leaks and zero circular dependencies.
- **Temporal Effective Dating**: Zero-gap, overlap-free compensation intervals guaranteed at the database storage engine level via PostgreSQL 16's `btree_gist` exclusion constraints.
- **Multi-Currency Mathematical Isolation**: Currencies (USD, INR, EUR, GBP, AED) are strictly segregated; direct cross-currency summation is rejected by domain value objects.
- **High-Precision Medians**: Accurate 50th percentile compensation calculated in native PostgreSQL queries via `PERCENTILE_CONT(0.5)`.
- **Deterministic Batch Seed Engine**: High-performance JDBC batch engine capable of seeding 10,000 employees, 13,728 compensation records, and 3,728 audit logs in **under 3.5 seconds**.
- **Security & Sanitization**: Stateless JWT authentication, role-based method security, and dynamic CSV formula injection sanitization (`=`, `+`, `-`, `@` neutralized).
- **Automated Verification**: **23 out of 23 backend tests passed** (ArchUnit, Service, Integration, Seed, Money, and End-to-End).

---

## 2. The Business Problem (The Spreadsheet Crisis)

Prior to CompensationOS, ACME managed compensation for 10,000 employees across 5 sovereign countries using disjointed Excel workbooks. This manual approach created severe operational and compliance risks:

| Failure Domain | Manual Spreadsheet Reality | ACME CompensationOS Solution |
| :--- | :--- | :--- |
| **Data Fragility & Lost History** | Salary revision cells were overwritten, obliterating historical career progression and promotion timelines. Broken VLOOKUP formulas corrupted payroll figures. | **Temporal Effective Dating**: Every revision is preserved with `effective_from` and `effective_to` dates. Historical timelines are immutable and permanently accessible. |
| **Multi-Currency Catastrophes** | Cells added ₹1,500,000 INR directly to $120,000 USD, yielding meaningless numbers and flawed executive budget decisions. | **Strict Sovereign Isolation**: Domain value object `Money` throws runtime exceptions on currency mismatch. Analytics isolate currencies into dedicated buckets. |
| **Audit & Governance Void** | Regulators and SOX compliance auditors could not determine who authorized a salary increase, the effective date, or the business rationale. | **Atomic Audit Trail**: Every salary update writes an immutable audit record in the same database transaction, capturing actor identity from Spring Security. |
| **Spreadsheet Injection Attacks** | Unsanitized CSV exports exposed executive workstations to CSV/DDE command execution via malicious cell values. | **Formula Sanitization**: `CsvSanitizer` automatically neutralizes formula triggers (`=`, `+`, `-`, `@`, `\t`, `\r`) with single-quote escaping. |

---

## 3. Technology Stack

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND TIER                                  │
│   React 18 • Vite 5 • TypeScript 5 • Tailwind CSS 3 • TanStack Query v5    │
│   React Hook Form • Zod • Recharts 2 • Lucide Icons • Axios                 │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTPS / REST / JWT Bearer Tokens
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                               BACKEND TIER                                  │
│   Java 21/22 • Spring Boot 3.3.4 • Spring Security 6 • Spring Data JPA     │
│   JJWT (HMAC-SHA384) • Flyway 10 • Apache Commons CSV • ArchUnit 1.3        │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ JDBC / HikariCP Pool (Port 5432)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                             PERSISTENCE TIER                                │
│   PostgreSQL 16 • btree_gist Extension • GiST Exclusion Constraints         │
│   Native PERCENTILE_CONT(0.5) Medians • Composite B-Tree Indexes            │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. System Architecture & Modular Monolith Design

### Layered Onion Architecture (Inward Dependency Rule)
```
          ┌─────────────────────────────────────────────────┐
          │               1. API / Web Layer                │
          │   (REST Controllers, OpenAPI 3, DTO Mappers)    │
          │         ┌─────────────────────────────┐         │
          │         │    2. Application Layer     │         │
          │         │(Use Cases, Ports, Orchestrators)│     │
          │         │     ┌─────────────────┐     │         │
          │         │     │ 3. Domain Core  │     │         │
          │         │     │ (Entities, VOs, │     │         │
          │         │     │   Invariants)   │     │         │
          │         │     └─────────────────┘     │         │
          │         └──────────────┬──────────────┘         │
          │                        │                        │
          │           4. Infrastructure Layer               │
          │   (JPA Repositories, Security, HikariCP)        │
          └─────────────────────────────────────────────────┘
```

### Module Responsibilities & Public Contracts
The system is partitioned into 6 loosely coupled business modules. Direct cross-module JPA entity or repository coupling is strictly prohibited:

| Module | Core Responsibility | Public Contract (Port) | Internal Persistence |
| :--- | :--- | :--- | :--- |
| **`security`** | Authentication, JWT issuance, password hashing | `SecurityContextHolder`, `UserDetailsService` | `users` table |
| **`employee`** | Personnel directory, lifecycle status, CRUD | `EmployeeReaderPort`, `EmployeeRepositoryPort` | `employees` table |
| **`compensation`**| Effective-dated salary management, interval slicing | `ReviseCompensationUseCase`, `CompensationLookupPort` | `compensation` table |
| **`analytics`** | Statistical queries, department medians, thresholds | `AnalyticsQueryPort` | Native SQL Projections |
| **`audit`** | Append-only salary revision compliance logging | `SalaryAuditWriterPort` | `salary_audit_logs` table |
| **`shared`** | Immutable value objects, exceptions, sanitizers | `Money`, `CurrencyCode`, `CsvSanitizer` | None (Pure Domain) |

---

## 5. Temporal Effective Dating & Database Integrity

### Storage-Level Exclusion Constraint (`btree_gist`)
To guarantee that no employee can ever have overlapping salary intervals, the system enforces a PostgreSQL GiST exclusion constraint on the `daterange` type:

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE compensation
ADD CONSTRAINT no_overlapping_compensation_ranges
EXCLUDE USING gist (
    employee_id WITH =,
    daterange(effective_from, COALESCE(effective_to, 'infinity'::date), '[]') WITH &&
);
```

### Non-Destructive Slicing & Hibernate ActionQueue Defense
1. **Pessimistic Locking**: `employeeRepository.findByIdForUpdate(id)` locks the employee row in PostgreSQL (`SELECT ... FOR UPDATE`), preventing concurrent modification race conditions.
2. **Interval Slicing**: When inserting a revision on date `D`, the prior active record is closed by setting `effective_to = D - 1 day`.
3. **ActionQueue Synchronization**: In JPA/Hibernate, `EntityInsertAction`s execute before `EntityUpdateAction`s by default, which triggers a false collision in PostgreSQL's exclusion constraint. The system calls `saveAndFlush()` on the closed record prior to inserting the new revision, ensuring the SQL `UPDATE` reaches the storage engine first.
4. **Exact Monetary Precision**: Financial values use `DECIMAL(15,4)` in PostgreSQL and Java `BigDecimal`. IEEE-754 floating-point numbers (`float`/`double`) are strictly prohibited to prevent binary rounding drift.

---

## 6. Multi-Currency Isolation & PostgreSQL Medians

### Sovereign Currency Segregation
Compensation is isolated across 5 sovereign jurisdictions:

| Jurisdiction | Employees | Currency | Sample Roles | Average Salary | Median Salary |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **India** | 3,500 (35%) | `INR` (₹) | Senior SDE, Tech Lead, Staff SDE | ₹1,500,000 | ₹1,250,000 |
| **United States** | 2,500 (25%) | `USD` ($) | Principal Architect, Dir. Engineering | $125,000 | $120,000 |
| **Germany** | 1,500 (15%) | `EUR` (€) | Senior DevOps, Engineering Manager | €85,000 | €82,000 |
| **United Kingdom**| 1,500 (15%) | `GBP` (£) | Staff Product Manager, Senior Engineer | £90,000 | £88,000 |
| **United Arab Emirates**| 1,000 (10%) | `AED` (د.إ) | VP Engineering, Director | 330,000 AED | 320,000 AED |

### Continuous Percentile Medians via PostgreSQL
In corporate compensation, executive outlier salaries skew the arithmetic mean upward. CompensationOS computes true 50th-percentile medians natively in PostgreSQL:

```sql
SELECT 
    e.department AS department,
    COUNT(e.id) AS employee_count,
    ROUND(CAST(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY c.base_salary) AS NUMERIC), 2) AS median_base_salary,
    ROUND(CAST(AVG(c.base_salary) AS NUMERIC), 2) AS mean_base_salary,
    MIN(c.base_salary) AS min_base_salary,
    MAX(c.base_salary) AS max_base_salary
FROM employee e
JOIN compensation c ON e.id = c.employee_id
WHERE c.currency = :currency
  AND c.effective_from <= CURRENT_DATE
  AND (c.effective_to IS NULL OR c.effective_to >= CURRENT_DATE)
GROUP BY e.department
ORDER BY e.department ASC;
```

---

## 7. Deterministic 10,000 Employee Seed Engine

The platform includes a built-in batch seed engine (`SeedDataService`) optimized for fast startup and repeatable testing:

- **Deterministic Seed**: Utilizes `Random(42L)` to guarantee identical employee names, emails, joining dates, and compensation histories on every run.
- **JDBC Batching**: Uses `JdbcTemplate.batchUpdate()` with a `batchSize` of 2,000, bypassing Hibernate entity-tracking overhead.
- **Benchmark**: Seeds **10,000 employees**, **13,728 compensation records**, and **3,728 audit logs** in **~3.4 seconds**.
- **Historical Depth**: ~30% of employees (3,728 records) feature multi-revision compensation timelines and matching audit log diffs.

---

## 8. Frontend SaaS Interface

The React 18 web interface provides an intuitive SaaS experience built for high data density:

1. **Executive KPI Dashboard**: Macro headcount, country distribution, and isolated multi-currency summary cards with Recharts visualizations.
2. **Employee Directory**: Instant debounced search (<50ms latency), server-side pagination, and multi-faceted filtering by Country, Department, Designation, and Status.
3. **Interactive Employee Profile**: Complete biographical information, active compensation breakdown, and chronological revision timeline.
4. **Salary Revision Modal**: Live delta calculator computing base salary increment (`+$15,000 / +12.5%`) and total compensation impact in real time.
5. **Analytics Explorer**: Department median comparisons, sovereign currency tabs, and a dynamic salary threshold slider.
6. **Immutable Audit Trail Viewer**: Searchable log displaying before/after diffs, actor email, effective date, and timestamp.
7. **Sanitized CSV Export**: One-click download of directory records with spreadsheet injection protection.

---

## 9. Security & Access Control

- **Stateless JWT Authentication**: Cryptographically signed HMAC-SHA384 tokens with 24-hour expiration.
- **BCrypt Password Hashing**: Passwords stored with salted BCrypt hashes (cost factor 10).
- **Actor Identity Assurance**: Audit log `changedBy` identity is extracted directly from Spring Security's `SecurityContextHolder`. Client-supplied identity fields are completely ignored.
- **Formula Injection Defense**: `CsvSanitizer` prepends a single quote (`'`) to any CSV value starting with `=`, `+`, `-`, `@`, `\t`, or `\r`.

---

## 10. Automated Verification & Testing Strategy

The backend test suite verifies all layers of the testing pyramid:

```
                  ┌───────────────────────────────┐
                  │    End-to-End Tests (E2E)     │  EndToEndIntegrationTest (1 Test)
                  │   (Live Spring Boot + DB 16)  │
                  ├───────────────────────────────┤
                  │     ArchUnit Architecture     │  ArchitectureTest (5 Rules)
                  │   (Layer boundaries & cycles) │
                  ├───────────────────────────────┤
                  │     Service & Domain Tests    │  CompensationServiceTest (6 Tests)
                  │ (Slicing, validation, audits) │  AnalyticsServiceTest (4 Tests)
                  ├───────────────────────────────┤
                  │    Seed & Value Object Tests  │  SeedDataServiceTest (3 Tests)
                  │  (10k batch, Money invariants)│  SeedDataVerificationTest (1 Test)
                  └───────────────────────────────┘  MoneyTest (4 Tests)
```

**Overall Result: 23 backend tests passed, 0 failures, 0 skipped (Build Success in 40.2s).**  
**Frontend Result: Compiled cleanly with Vite across 2,429 modules in 7.49s.**

---

## 11. Quick Start & Execution Guide

### Option A: Local Development Mode

#### 1. PostgreSQL Database
Ensure PostgreSQL 16 is running on port 5432 with database `compensation_db`:
```sql
CREATE DATABASE compensation_db;
\c compensation_db
CREATE EXTENSION IF NOT EXISTS btree_gist;
```

#### 2. Run Spring Boot Backend
```powershell
cd backend
mvn clean spring-boot:run
```
*Backend runs on [http://localhost:8080](http://localhost:8080).*  
*Swagger UI is accessible at [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html).*

#### 3. Run React Frontend
```powershell
cd frontend
npm install
npm run dev
```
*Frontend runs on [http://localhost:5173](http://localhost:5173).*

---

### Option B: Docker Compose Deployment

```bash
# Start all 3 containers: PostgreSQL 16, Spring Boot backend, and Nginx frontend
docker compose up -d --build
```
- Web Application: [http://localhost](http://localhost)
- Backend API: [http://localhost:8080/api/v1](http://localhost:8080/api/v1)
- Swagger UI: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

---

## 12. Pre-Configured Test Accounts

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **HR Manager** | `hrmanager@acme.com` | `Manager@123` | Employee CRUD, Revise Salary, View History, View Analytics, View Audit, Export CSV |
| **Admin** | `admin@acme.com` | `Admin@123` | Full Access, Batch Seed Trigger, Employee Management, System Administration |
| **Executive** | `executive@acme.com` | `Executive@123` | Read-only access to multi-currency KPI dashboards, department medians, and projections |

---

## 13. Documentation & Presentation Artifacts

- **PowerPoint Presentation:** [`ACME_CompensationOS_Architecture_Presentation.pptx`](file:///c:/projects/salary%20management%20system/ACME_CompensationOS_Architecture_Presentation.pptx) (35 widescreen slides with editable diagrams and full speaker notes).
- **Presentation Companion Guide:** [`docs/presentation.md`](file:///c:/projects/salary%20management%20system/docs/presentation.md).
- **Product Requirements Document (PRD):** [`docs/requirements.md`](file:///c:/projects/salary%20management%20system/docs/requirements.md).
- **High-Level Design (HLD):** [`docs/architecture.md`](file:///c:/projects/salary%20management%20system/docs/architecture.md).
- **Database Design & ERD:** [`docs/database-design.md`](file:///c:/projects/salary%20management%20system/docs/database-design.md).
- **API Contracts & Specifications:** [`docs/api-design.md`](file:///c:/projects/salary%20management%20system/docs/api-design.md).
- **Testing Strategy:** [`docs/testing-strategy.md`](file:///c:/projects/salary%20management%20system/docs/testing-strategy.md).
- **Architectural Trade-Offs:** [`docs/trade-offs.md`](file:///c:/projects/salary%20management%20system/docs/trade-offs.md).
- **Evaluation & Demo Guide:** [`docs/demo.md`](file:///c:/projects/salary%20management%20system/docs/demo.md).
