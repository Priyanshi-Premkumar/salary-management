# ACME CompensationOS: Product Requirements Document (PRD)

> **Document Identifier:** PRD-ACME-COMP-001  
> **Target Release:** Version 1.0.0 (Production Architecture)  
> **System Scope:** Global Employee Compensation Management (10,000+ Employees across 5 Jurisdictions)  
> **Primary Authors:** Principal Software Architect, Senior Product Designer, Lead QA Engineer  

---

## 1. Executive Summary & Business Context

### 1.1 Organizational Background
**ACME Corporation** is a high-growth multinational enterprise employing over 10,000 staff across five sovereign jurisdictions:
- **India (IND)**: 3,500 employees (Operating currency: `INR` - ₹)
- **United States (USA)**: 2,500 employees (Operating currency: `USD` - $)
- **Germany (DEU)**: 1,500 employees (Operating currency: `EUR` - €)
- **United Kingdom (GBR)**: 1,500 employees (Operating currency: `GBP` - £)
- **United Arab Emirates (ARE)**: 1,000 employees (Operating currency: `AED` - د.إ)

### 1.2 The Legacy Problem (The Spreadsheet Crisis)
Prior to this platform, ACME managed global compensation across disjointed desktop spreadsheets (Microsoft Excel). This generated critical business vulnerabilities:
1. **Destructive Overwriting**: Adjusting an employee's salary overwrote previous numbers, permanently erasing promotion records, market correction histories, and compensation timelines.
2. **Invalid Cross-Currency Summation**: Global payroll aggregates routinely added disparate currencies together without conversion (e.g., adding ₹1,500,000 INR directly to $120,000 USD), producing mathematically invalid financial reports.
3. **Regulatory Non-Compliance**: Lack of an immutable audit trail violated SOX and international financial compliance standards. Auditors could not verify who authorized raises or view historical snapshots.
4. **Data Security & Injection Vulnerabilities**: Sensitive compensation data lived in unencrypted files. CSV exports were susceptible to CSV/DDE spreadsheet formula injection attacks (`=CMD|`, `@SUM`).

### 1.3 Strategic Objectives & Success Metrics
- **Centralized Single Source of Truth**: Replace all manual spreadsheets with an enterprise SaaS application managing 10,000+ active records.
- **Zero-Gap Temporal History**: Guarantee that compensation records are never overwritten. Every revision must be effective-dated and preserved indefinitely.
- **Storage-Level Concurrency & Overlap Prevention**: 100% guarantee that no employee can possess overlapping compensation intervals, enforced at the database storage engine level.
- **Sovereign Currency Analytics**: Complete isolation of sovereign currencies in executive reporting, computing exact 50th-percentile medians in sub-100ms.
- **Immutable Transactional Auditing**: Automatic, tamper-evident recording of every compensation adjustment in the same atomic database transaction.

---

## 2. User Personas & Stakeholder Analysis

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   CORE USER PERSONAS                                   │
├──────────────────────────┬──────────────────────────┬──────────────────────────────────┤
│   PRIMARY: HR MANAGER    │   SECONDARY: EXECUTIVE   │      GOVERNANCE: AUDITOR         │
│   (Elena Vance)          │   (Marcus Vance - VP HR) │      (Sophia Chen - SOX)         │
├──────────────────────────┼──────────────────────────┼──────────────────────────────────┤
│ • Daily directory search │ • Macro KPI dashboards   │ • Complete revision changelogs   │
│ • Executes revisions     │ • Department medians     │ • Verifies who authorized raises │
│ • Live delta preview     │ • Salary distributions   │ • Pre/post salary diff analysis  │
│ • Formula-safe CSV export│ • Threshold projections  │ • Zero data tampering validation │
└──────────────────────────┴──────────────────────────┴──────────────────────────────────┘
```

### 2.1 Primary Persona: Elena Vance (Global HR Operations Manager)
- **Demographics**: 34, Senior Compensation Lead, manages day-to-day employee operations.
- **Key Goals**: Quickly look up employee profiles across countries, execute scheduled salary revisions without date calculation errors, view past promotion timelines, and export sanitized spreadsheets for payroll processing.
- **Frustrations**: Fear of breaking spreadsheet formulas, accidental date collisions, manual percentage calculation errors, and slow search tools across large datasets.

### 2.2 Secondary Persona: Marcus Vance (VP of People & Chief Financial Officer)
- **Key Goals**: Review real-time executive compensation summaries by country and department, analyze true salary medians (free from executive outlier skew), and query custom salary band thresholds.
- **Frustrations**: Inaccurate macro reports, un-normalized currency blending, and waiting days for data science teams to manually calculate department medians.

### 2.3 Governance Persona: Sophia Chen (Lead Compliance & SOX Auditor)
- **Key Goals**: Verify that every corporate salary change is accompanied by an immutable record capturing the actor, previous salary, new salary, change reason, and timestamp.
- **Frustrations**: Unauditable spreadsheet edits, spoofed usernames, and lack of database-enforced transaction boundaries.

---

## 3. Comprehensive Functional Requirements (FR)

### 3.1 Module 1: Employee Directory & Lifecycle Management

| ID | Title | Description | Priority | Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- |
| **FR-EMP-01** | Employee Registration | System shall allow HR Managers to register new employees with automatic validation. | P0 (Must) | Requires unique `employee_code`, unique `email`, full name, country, department, designation, and valid joining date. |
| **FR-EMP-02** | Instant Debounced Search | System shall provide a single unified search bar across 10,000 employees. | P0 (Must) | Debounced at 300ms; queries name, employee code, and email; returns paginated results in < 50ms. |
| **FR-EMP-03** | Multi-Faceted Filtering | Directory shall allow combining filters for Country, Department, Designation, and Employment Status. | P0 (Must) | Dynamic SQL predicates; avoids full table scans; preserves active pagination state in URL. |
| **FR-EMP-04** | Status Lifecycle Management | System shall track employee employment lifecycle states. | P0 (Must) | Supported statuses: `ACTIVE`, `TERMINATED`, `RESIGNED`, `ON_LEAVE`. Terminated employees cannot receive future salary revisions. |
| **FR-EMP-05** | Server-Side Pagination | Directory shall paginate results server-side with configurable page sizes (20, 50, 100). | P0 (Must) | Returns total elements, total pages, current page, and navigation cursors. |

### 3.2 Module 2: Compensation & Temporal Effective Dating

| ID | Title | Description | Priority | Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- |
| **FR-CMP-01** | Initial Compensation Setup | During onboarding, system assigns initial base salary, bonus, currency, and effective start date. | P0 (Must) | Base salary must be > 0. Bonus must be >= 0. Currency must match employee jurisdiction. |
| **FR-CMP-02** | Exact Financial Precision | Financial amounts must be stored and computed with exact decimal precision. | P0 (Must) | Stored as `DECIMAL(15,4)` in PostgreSQL and `BigDecimal` in Java. Zero IEEE-754 floating-point math. |
| **FR-CMP-03** | Non-Destructive Interval Slicing | Submitting a salary revision on date `D` shall automatically slice the prior record to `D - 1 day`. | P0 (Must) | Prior record closed without deleting data. New revision inserted with `effective_from = D`. Zero day gaps. |
| **FR-CMP-04** | Storage-Level Overlap Exclusion | System must prevent overlapping compensation intervals for any employee. | P0 (Must) | Enforced via PostgreSQL `btree_gist` GiST exclusion constraint on `daterange(effective_from, effective_to)`. |
| **FR-CMP-05** | Chronological Timeline History | Profile shall display all past, current, and future scheduled compensation revisions. | P0 (Must) | Shows status badges (`CURRENT`, `HISTORICAL`, `FUTURE`), delta increments (+$15,000), and percentage changes (+12.5%). |
| **FR-CMP-06** | Concurrency Lock Protection | System shall prevent concurrent modification conflicts when two users edit the same employee. | P0 (Must) | Acquires row-level write lock (`SELECT ... FOR UPDATE`) during revision execution. |

### 3.3 Module 3: Multi-Currency Analytics & Statistics

| ID | Title | Description | Priority | Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- |
| **FR-ANA-01** | Sovereign Currency Segregation | System shall never mix or aggregate different sovereign currencies in calculations. | P0 (Must) | All executive dashboards isolate `USD`, `INR`, `EUR`, `GBP`, and `AED`. Value object `Money` throws exception on currency mismatch. |
| **FR-ANA-02** | Executive KPI Dashboard | Overview screen displaying macro metrics per currency cohort. | P0 (Must) | Displays Total Headcount, Active Staff, Currency Payroll Sums, Average Base Salary, and Min/Max ranges. |
| **FR-ANA-03** | Native PostgreSQL Percentile Medians | Department compensation medians must be calculated in native SQL. | P0 (Must) | Computed via `PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY base_salary)` directly in PostgreSQL engine. |
| **FR-ANA-04** | Dynamic Threshold Calculator | Interactive tool allowing executives to query employee counts above any salary cutoff. | P1 (Should) | Slider input; calculates count of employees and percentage of workforce above threshold for selected currency. |
| **FR-ANA-05** | Visual Compensation Distribution | Recharts visualizations of department headcount and compensation band histograms. | P1 (Should) | Rendered client-side; updates instantly when toggling sovereign currency selector pills. |

### 3.4 Module 4: Audit Trail & Regulatory Compliance

| ID | Title | Description | Priority | Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- |
| **FR-AUD-01** | Atomic Audit Logging | Every compensation revision must automatically generate an audit log record. | P0 (Must) | Executed within the same `@Transactional` boundary. Rollback of revision rolls back audit; audit failure rolls back revision. |
| **FR-AUD-02** | Tamper-Evident Audit Fields | Audit records must capture complete pre/post state and actor identity. | P0 (Must) | Captures `employee_id`, `changed_by` (authenticated email), `previous_base_salary`, `new_base_salary`, diffs, reason, and timestamp. |
| **FR-AUD-03** | Actor Identity Assurance | Audit actor identity must originate strictly from the backend security context. | P0 (Must) | Retrieved from `SecurityContextHolder.getContext().getAuthentication().getName()`. Frontend-supplied identity fields are rejected. |
| **FR-AUD-04** | Immutability | Audit logs cannot be modified or deleted through any application API. | P0 (Must) | Zero HTTP `PUT`, `PATCH`, or `DELETE` endpoints exposed for audit records. |

### 3.5 Module 5: Secure Data Export

| ID | Title | Description | Priority | Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- |
| **FR-EXP-01** | Streaming CSV Export | HR Managers can export filtered directory and audit logs to CSV. | P0 (Must) | Uses non-blocking `StreamingResponseBody` with Apache Commons CSV; prevents high memory consumption on 10k rows. |
| **FR-EXP-02** | Formula Injection Sanitization | All CSV text fields must be sanitized against spreadsheet command injection. | P0 (Must) | `CsvSanitizer` prepends `'` to any value starting with `=`, `+`, `-`, `@`, `\t`, or `\r`. |

### 3.6 Module 6: Authentication & Role-Based Access Control (RBAC)

| ID | Title | Description | Priority | Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- |
| **FR-SEC-01** | Stateless JWT Authentication | Users authenticate using email and password to receive a signed JWT token. | P0 (Must) | HMAC-SHA384 signed token; 24-hour expiration; claims contain `userId`, `email`, and `role`. |
| **FR-SEC-02** | Password Hashing | User passwords must be stored using cryptographically secure hashing. | P0 (Must) | Salted BCrypt password encoding with cost factor 10. |
| **FR-SEC-03** | Method-Level RBAC | Endpoints must enforce role permissions. | P0 (Must) | Roles: `ROLE_ADMIN` (full control + seeding), `ROLE_HR_MANAGER` (CRUD, revisions, exports), `ROLE_EXECUTIVE` (read-only analytics). |

---

## 4. Non-Functional Requirements (NFR) & Technical SLAs

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        NON-FUNCTIONAL SERVICE LEVEL AGREEMENTS                         │
├──────────────────────────┬──────────────────────────┬──────────────────────────────────┤
│    SCALE & CAPACITY      │   LATENCY & EFFICIENCY   │       DATABASE INTEGRITY         │
├──────────────────────────┼──────────────────────────┼──────────────────────────────────┤
│ • 10,000+ Active Staff   │ • Directory Search <50ms │ • btree_gist Exclusion           │
│ • 25,000+ Comp Revisions │ • Analytics Queries <100ms│ • DECIMAL(15,4) Precision        │
│ • 10k Batch Seed < 3.5s  │ • CSV Streaming Stream   │ • Zero Overlapping Ranges        │
├──────────────────────────┼──────────────────────────┼──────────────────────────────────┤
│   SECURITY & PRIVACY     │   CLEAN ARCHITECTURE     │     HIGH RELIABILITY             │
├──────────────────────────┼──────────────────────────┼──────────────────────────────────┤
│ • Stateless HMAC-SHA384  │ • ArchUnit Test Verified │ • 99.9% Application Uptime       │
│ • CsvSanitizer Injection │ • Zero Layer Dependency  │ • Multi-Stage Docker Build       │
│ • Zero Client Identity   │ • Zero Package Cycles    │ • Automated Flyway Migrations    │
└──────────────────────────┴──────────────────────────┴──────────────────────────────────┘
```

### 4.1 Performance & Latency (NFR-PERF)
- **NFR-PERF-01 (Search Latency)**: Debounced search queries across 10,000 records must execute in under **50 milliseconds** using composite B-Tree indexes.
- **NFR-PERF-02 (Analytics SLA)**: Executive dashboard and department percentile median queries must return in under **100 milliseconds**.
- **NFR-PERF-03 (Batch Seeding Speed)**: Populating the full 10,000 employee population, 13,728 compensation records, and 3,728 audit logs via JDBC batching must complete in under **4.0 seconds** (Benchmark: 3.4 seconds).
- **NFR-PERF-04 (Streaming Export)**: Exporting the entire employee directory to CSV must stream rows via `OutputStream` to maintain constant O(1) JVM heap memory consumption.

### 4.2 Data Integrity & Precision (NFR-DATA)
- **NFR-DATA-01 (Zero Temporal Overlap)**: Under concurrent load, the system must mathematically reject any insertion producing overlapping compensation intervals for the same employee via `EXCLUDE USING gist`.
- **NFR-DATA-02 (Monetary Precision)**: Financial calculations must use exact fixed-point decimals (`NUMERIC(15,4)` in PostgreSQL and `BigDecimal` with `RoundingMode.HALF_UP` in Java).

### 4.3 Architectural Maintainability (NFR-ARCH)
- **NFR-ARCH-01 (Clean Architecture Enforcement)**: Business domain entities must have zero dependencies on frameworks, databases, or Spring web libraries.
- **NFR-ARCH-02 (Static Verification)**: Automated **ArchUnit** tests must fail the build if circular dependencies or cross-module JPA leaks are introduced.
- **NFR-ARCH-03 (Modular Decoupling)**: Modules communicate solely via Java Port interfaces (`CompensationLookupPort`, `CompensationInitPort`) and DTOs.

---

## 5. Business Rules & Decision Invariants

```
                                 [ HR Submits Revision ]
                                            │
                                            ▼
                             ┌──────────────────────────────┐
                             │ Gate 1: Is Employee ACTIVE?  │─── No ───► [ 400 Bad Request ]
                             └──────────────┬───────────────┘
                                            │ Yes
                                            ▼
                             ┌──────────────────────────────┐
                             │ Gate 2: Effective Date >=    │─── No ───► [ 400 Bad Request ]
                             │         Joining Date?        │
                             └──────────────┬───────────────┘
                                            │ Yes
                                            ▼
                             ┌──────────────────────────────┐
                             │ Gate 3: Does Another Record  │─── Yes ──► [ 400 Bad Request ]
                             │   Start on Exact Same Date?  │
                             └──────────────┬───────────────┘
                                            │ No
                                            ▼
                             ┌──────────────────────────────┐
                             │ Encompassing Interval Found? │
                             └──────────────┬───────────────┘
                                            │
                     ┌──────────────────────┴──────────────────────┐
                     │ Yes                                         │ No (Future Beyond Current)
                     ▼                                             ▼
          [ Slice Prior Record: ]                       [ Slice Latest Open Record: ]
          [ effective_to = D - 1]                       [ effective_to = D - 1      ]
                     │                                             │
                     └──────────────────────┬──────────────────────┘
                                            │
                                            ▼
                             ┌──────────────────────────────┐
                             │ Force saveAndFlush() to DB   │ (Defeats ActionQueue reordering)
                             └──────────────┬───────────────┘
                                            │
                                            ▼
                             ┌──────────────────────────────┐
                             │ Insert New Revision Record   │
                             │ Insert Immutable Audit Log   │
                             └──────────────┬───────────────┘
                                            │
                                            ▼
                             ┌──────────────────────────────┐
                             │ PostgreSQL btree_gist Check  │─── Overlap ──► [ 409 Conflict ]
                             └──────────────┬───────────────┘
                                            │ Success
                                            ▼
                             [ Commit Transaction & Return 201 ]
```

1. **Rule BR-01 (Active Employment Check)**: Salary revisions can only be performed for employees whose `employment_status == ACTIVE`. Employees who are `TERMINATED` or `RESIGNED` are locked.
2. **Rule BR-02 (Hire Date Boundary)**: A revision effective date cannot precede the employee's verified `joining_date`.
3. **Rule BR-03 (Exact Date Collision)**: If a revision already starts on date `D`, the system rejects the request and prompts the user to select a distinct effective date.
4. **Rule BR-04 (Currency Sovereign Matching)**: The revision currency must strictly match the employee's sovereign jurisdiction currency (`INR`, `USD`, `EUR`, `GBP`, `AED`).
5. **Rule BR-05 (Mandatory Audit Association)**: A compensation record cannot exist without an accompanying audit log entry capturing the user email and reason.

---

## 6. Scope Boundaries & Roadmap

### 6.1 In-Scope (Phase 1: Production MVP)
- Complete 10,000 employee population seeded deterministically across India, USA, Germany, UK, and UAE.
- Full temporal effective dating with non-destructive slicing and PostgreSQL `btree_gist` exclusion constraints.
- Isolated multi-currency executive dashboards, department medians, and salary threshold calculator.
- Atomic salary revision workflow with live delta preview calculation.
- Append-only immutable salary audit trail with actor identity extraction from Spring Security.
- Sanitized CSV streaming exports.
- Clean Architecture verified via 5 ArchUnit rules.
- Full Docker Compose containerization (PostgreSQL, Spring Boot, React/Nginx).

### 6.2 Out-of-Scope (Phase 2: Future Architectural Roadmap)
- Real-time third-party foreign exchange (FX) market rate integration.
- Multi-step hierarchical approval workflows (e.g., manager -> VP -> HR Director approvals for raises > 15%).
- Automated payroll tax deduction calculation engine (India PF, US W2, German Sozialversicherung).
- Stock option and equity grant vesting schedule management (RSUs).
- Microservice decomposition with Apache Kafka and Transactional Outbox (deferred until scale exceeds 100k+ employees).

---

## 7. Acceptance Criteria & Definition of Done (DoD)

To achieve formal sign-off, the implementation must satisfy this verifiable checklist:

- [x] **Zero Overlapping Dates**: PostgreSQL storage engine rejects overlapping effective date intervals for any employee under concurrent execution.
- [x] **Mathematical Multi-Currency Isolation**: No dashboard card, SQL query, or domain calculation combines different currencies without explicit conversion.
- [x] **Continuous Percentile Medians**: Department medians match native `PERCENTILE_CONT(0.5)` projections executed in PostgreSQL.
- [x] **10,000 Employee Dataset**: Deterministic batch seed populates 10,000 employees, 13,728 compensation rows, and 3,728 audit logs in < 3.5 seconds.
- [x] **Automated Test Coverage**: **23 out of 23 backend tests pass** with zero failures (ArchUnit, Service, Integration, Seed, Money, and E2E).
- [x] **Frontend Build Cleanliness**: React 18 TypeScript build compiles 2,429 modules cleanly with zero type or lint errors.
- [x] **Formula Injection Sanitization**: All exported CSV rows prepend `'` to formula triggers (`=`, `+`, `-`, `@`).
- [x] **Full Containerization**: Starts cleanly via `docker compose up -d --build` with automated health checks.
