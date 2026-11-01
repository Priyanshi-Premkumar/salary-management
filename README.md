# ACME CompensationOS

> **Enterprise Compensation & Salary Revision Management Platform**  
> Scalable, audit-grade, multi-currency compensation management system engineered for 10,000+ employees across 5 global jurisdictions.

---

## 1. System Overview & Architecture

ACME CompensationOS is built according to **Domain-Driven Design (DDD)** and **Clean Architecture (Hexagonal / Ports and Adapters)** principles. It provides enterprise-grade compensation workflows, effective-dated salary revisions, atomic change auditing, and statistical compensation analytics across multiple isolated sovereign currencies.

```
+---------------------------------------------------------------------------------------+
|                                    React 18 Frontend                                  |
|         (Vite + TypeScript + Tailwind CSS + TanStack Query + Lucide Icons + Recharts) |
+---------------------------------------------------------------------------------------+
                                           |  HTTPS / REST / JWT
                                           v
+---------------------------------------------------------------------------------------+
|                               Spring Boot 3.3.4 (Java 21/22)                          |
|                                                                                       |
|  [ API Layer ]         REST Controllers, OpenAPI/Swagger 3, DTOs, Exception Advice    |
|       |                                                                               |
|  [ Application Layer ] Use Cases / Services, Inbound/Outbound Ports, DTO Mappers     |
|       |                                                                               |
|  [ Domain Layer ]      Entities, Value Objects (Money, Currency), Enums, Invariants   |
|       |                                                                               |
|  [ Infrastructure ]    Spring Data JPA, PostgreSQL Adapters, HikariCP, Security / JWT |
+---------------------------------------------------------------------------------------+
                                           |  JDBC / Hikari Connection Pool
                                           v
+---------------------------------------------------------------------------------------+
|                               PostgreSQL 16 Database                                  |
|  - btree_gist temporal exclusion constraint preventing overlapping effective dates    |
|  - PERCENTILE_CONT(0.5) PostgreSQL continuous percentile medians                      |
|  - Append-only immutable audit trail with before/after snapshots                      |
|  - High-performance deterministic 10,000 employee batch seed engine                  |
+---------------------------------------------------------------------------------------+
```

### Key Architectural Safeguards

1. **SOLID & Clean Architecture Enforced via ArchUnit Tests**:
   - `ArchitectureTest.java` statically verifies that Domain and Application layers never depend on Infrastructure or Web frameworks.
   - Modules communicate strictly through public port interfaces; no cross-module JPA entity or repository coupling.
2. **Temporal Effective Dating with Zero Gaps & No Overlaps**:
   - Every compensation revision has an `effective_from` date and an optional `effective_to` date.
   - PostgreSQL `btree_gist` exclusion constraint guarantees at the database storage engine level:
     ```sql
     EXCLUDE USING gist (
         employee_id WITH =,
         daterange(effective_from, COALESCE(effective_to, 'infinity'::date), '[]') WITH &&
     )
     ```
   - Concurrent modification attempts or race conditions cannot produce overlapping compensation windows.
3. **Strict Multi-Currency Isolation**:
   - Currencies are strictly segregated by sovereign unit: **USD ($)**, **INR (₹)**, **EUR (€)**, **GBP (£)**, and **AED (د.إ)**.
   - Value object `Money.add()` enforces currency matching; cross-currency arithmetic without explicit conversion is rejected at runtime.
   - Analytics metrics, aggregates, and charts never blend un-normalized currencies.
4. **PostgreSQL Median Projections**:
   - High-precision median calculations computed natively in PostgreSQL using `PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY c.base_salary)`.
5. **Spreadsheet Formula Injection Sanitization**:
   - Dynamic CSV export neutralizes characters (`=`, `+`, `-`, `@`, `\t`, `\r`) using `CsvSanitizer` to eliminate CSV/Excel injection vulnerabilities.
6. **Append-Only Immutable Audit Trail**:
   - Atomic recording of all compensation adjustments with previous salary, new salary, change reason, ISO timestamps, and authenticated actor (`SecurityContextHolder`).

---

## 2. Pre-Seeded Global Population (10,000 Employees)

The application includes a deterministic batch seed engine (`SeedDataService`) capable of populating 10,000 employees with historical salary revisions and audit logs in **under 3.5 seconds**:

| Jurisdiction | Employees | Currency | Departments | Sample Titles |
| :--- | :--- | :--- | :--- | :--- |
| **India** | 3,500 | `INR` (₹) | Engineering, Product, HR, Finance, Operations | Senior SDE, Tech Lead, Staff SDE |
| **United States** | 2,500 | `USD` ($) | Engineering, Product, HR, Finance, Operations | Principal Architect, Dir. Engineering |
| **Germany** | 1,500 | `EUR` (€) | Engineering, Product, HR, Finance, Operations | Senior DevOps, SDE II, Engineering Mgr |
| **United Kingdom**| 1,500 | `GBP` (£) | Engineering, Product, HR, Finance, Operations | Senior Engineer, Staff Product Mgr |
| **United Arab Emirates**| 1,000 | `AED` (د.إ)| Engineering, Product, HR, Finance, Operations | VP Engineering, Senior SDE |
| **Total** | **10,000** | — | — | **13,700+ Compensation Records** |

~30% of employees (~3,000 records) feature historical salary revisions and audit entries demonstrating historical salary progression.

---

## 3. Pre-Configured System Users

The application bootstraps three pre-configured accounts:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@acme.com` | `Admin@123` | Full administrative access, seed execution, employee & compensation management, analytics |
| **HR Manager** | `hrmanager@acme.com` | `Manager@123` | Employee onboarding, compensation revision execution, CSV export, audit review |
| **Executive** | `executive@acme.com` | `Executive@123` | Multi-currency executive dashboards, department medians, threshold projections, audit review (Read-Only) |

---

## 4. Quick Start: Running the Platform

### Prerequisites
- Java 21 or Java 22
- Maven 3.9+
- Node.js 20+ & npm
- PostgreSQL 16 (or Docker)

---

### Option A: Running with Docker Compose (Recommended)

To start PostgreSQL, the backend API, and the frontend web app together:

```bash
# Clone and navigate to repository
cd "c:/projects/salary management system"

# Launch all 3 services
docker compose up -d --build

# View logs
docker compose logs -f
```

- **Frontend**: [http://localhost](http://localhost)
- **Backend API**: [http://localhost:8080/api/v1](http://localhost:8080/api/v1)
- **Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

---

### Option B: Running Locally (Development Mode)

#### 1. PostgreSQL Database Setup
Ensure PostgreSQL is running on port 5432 with database `compensation_db`:
```sql
CREATE DATABASE compensation_db;
\c compensation_db
CREATE EXTENSION IF NOT EXISTS btree_gist;
```

#### 2. Start Spring Boot Backend
```powershell
cd backend
mvn clean spring-boot:run
```
*Flyway will automatically execute database migrations (`V1__init_schema.sql`, `V2__seed_users.sql`), and the deterministic 10k seed engine will execute automatically on startup if the database is empty.*

#### 3. Start React Frontend
```powershell
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 5. Automated Test Suite

ACME CompensationOS features comprehensive automated tests across all tiers:

```powershell
cd backend
mvn clean test
```

### Test Results Summary:
- **`ArchitectureTest`**: 5 ArchUnit rules verifying strict layered dependencies, onion architecture, public ports, and zero cyclical dependencies.
- **`EndToEndIntegrationTest`**: Complete live HTTP workflow with real PostgreSQL:
  1. JWT Authentication with HR Manager credentials
  2. Filtered employee search with pagination
  3. Atomic compensation revision with validation
  4. Temporal salary history verification (previous record closed, new record opened)
  5. Multi-currency analytics overview across all 5 currencies
  6. Department percentile medians via PostgreSQL `PERCENTILE_CONT(0.5)`
  7. Salary threshold projections
  8. Streaming CSV export with spreadsheet injection sanitization
- **`CompensationServiceTest`**: Unit tests for date overlap prevention, concurrent revision locking, and temporal validation.
- **`AnalyticsServiceTest`**: Unit tests for multi-currency isolation, department median calculations, and salary histogram distribution.
- **`SeedDataServiceTest` & `SeedDataVerificationTest`**: Verifies 10,000 deterministic employee seed generation and distribution.
- **`MoneyTest`**: Verifies immutable `Money` arithmetic and strict currency mismatch safeguards.

**Overall: 23 backend tests passed, 0 failures, 0 skipped.**

---

## 6. Frontend SaaS Feature Suite

- **Executive KPI Dashboard**: Live headcount, department counts, multi-currency salary summaries, and interactive Recharts distributions.
- **Employee Directory**: Instant text search, pagination, and multi-faceted filters by Country, Department, Designation, and Employment Status.
- **Interactive Employee Profile**: Complete biographical details, current compensation breakdown, and chronological salary revision timeline.
- **Salary Revision Workflow Modal**: Real-time salary increment preview, percentage change calculations, effective date selection, and validation.
- **Multi-Currency Analytics Suite**: Sovereign currency selector (USD, INR, EUR, GBP, AED), PostgreSQL department median charts, custom salary threshold projection calculator, and distribution histograms.
- **Immutable Audit Trail Viewer**: Searchable log of every compensation action with authenticated user email, timestamp, old vs. new salary, and reason.
- **Sanitized CSV Export**: One-click download of directory records with formulas neutralized.

---

## 7. Technology Stack

- **Backend**: Java 22, Spring Boot 3.3.4, Spring Data JPA, Spring Security 6, JJWT, Flyway, Apache Commons CSV, ArchUnit.
- **Database**: PostgreSQL 16 with `btree_gist` extension, HikariCP connection pool.
- **Frontend**: React 18, Vite 5, TypeScript 5, Tailwind CSS, TanStack Query (React Query v5), Recharts, Lucide React, Axios.
- **DevOps**: Docker, Docker Compose, Multi-stage Dockerfiles, Nginx Alpine.
