# ACME CompensationOS: Critical Architecture Review & Hardening Specifications

**Document Version:** 1.0.0  
**Status:** Approved for Implementation (Pre-Build Review)  
**Author:** Principal Software Architect & Lead Engineering Reviewer  
**Target System:** ACME CompensationOS (Modular Monolith)

---

## 1. Executive Review Summary

This document performs an exhaustive, critical architectural evaluation of the **ACME CompensationOS** implementation plan prior to code generation. 

While the initial plan established a sound modular monolithic direction, this review identifies critical technical subtleties, potential design pitfalls, concurrency hazards, and temporal data integrity edge cases that must be definitively addressed.

### Key Corrections & Architectural Mandates:
1. **No "Zero-Rework" Microservice Claims**: Realistically document the substantial architectural friction of extracting microservices (distributed transactions, loss of database-level foreign keys, transactional outbox requirements, and network latency).
2. **PostgreSQL Exclusion Constraints for Overlap Prevention**: Application-level date checks are vulnerable to race conditions. Overlapping compensation periods must be prevented at the database engine level using PostgreSQL `EXCLUDE USING gist` with `daterange`.
3. **Temporal Validity Semantics**: Clearly distinguish between *Current*, *Past*, and *Future* effective-dated compensation. A naive `effective_to IS NULL` check breaks when future revisions are scheduled.
4. **Security Context Integrity**: The actor responsible for salary revisions (`changed_by`) must be strictly extracted from the authenticated server-side JWT `SecurityContext`, never accepted from the request body.
5. **Database-Enforced Concurrency Locking**: Concurrent revisions for the same employee must be serialized using pessimistic write locking (`SELECT ... FOR UPDATE` on the parent employee record) to prevent inconsistent date-range slices.
6. **ArchUnit Guardrails**: Module isolation and Clean Architecture dependency directions must be strictly enforced via automated architecture tests in CI.
7. **Deterministic, Opt-In Data Seeder**: The 10,000 employee seed engine must be idempotent, reproducible with fixed pseudo-random seeds, and guarded against accidental re-execution on application restarts.

---

## 2. SOLID Principles & Clean Architecture Enforcement

### 2.1 Package & Module Structure
The modular monolith must maintain strict boundaries. Each functional module (`employee`, `compensation`, `analytics`, `audit`, `security`) is organized internally following Clean Architecture / Ports and Adapters:

```
com.acme.compensation.<module>
├── domain
│   ├── model          <-- Pure domain objects & value objects (No Spring/JPA annotations)
│   ├── event          <-- Domain events (e.g., SalaryRevisedEvent)
│   └── exception      <-- Module-specific domain exceptions
├── application
│   ├── port
│   │   ├── in         <-- Use cases / Driving ports (e.g., ReviseSalaryUseCase)
│   │   └── out        <-- Driven ports / SPIs (e.g., CompensationRepositoryPort)
│   ├── service        <-- Use case implementations / Application orchestrators
│   └── dto            <-- Public Application DTOs (Request / Response / Summaries)
├── infrastructure
│   ├── persistence    <-- JPA Repositories, Spring Data interfaces, JPA Entities, Mappers
│   └── adapter        <-- Port implementations adapting DB/external calls
└── api
    ├── controller     <-- REST Controllers (Spring MVC)
    ├── request        <-- API input payloads (Bean Validation)
    └── response       <-- API output envelopes
```

### 2.2 Concrete SOLID Implementation Matrix

| Principle | Architectural Rule & Implementation Pattern | Violation Anti-Pattern to Prevent |
|---|---|---|
| **Single Responsibility (SRP)** | - `SalaryRevisionService`: Only handles salary revision business workflows.<br>- `CompensationQueryService`: Only handles read queries and history lookups.<br>- `SalaryAuditService`: Only handles audit trail writes and audit reads.<br>- `CsvExportService`: Only handles streaming CSV serialization. | Fat controllers containing validation and persistence; entities performing DB operations. |
| **Open/Closed (OCP)** | - `ExportFormatter` strategy interface allows adding Excel or JSON streaming without touching CSV export workflows.<br>- `AnalyticsCalculator` strategies allow pluggable statistical models. | Switch statements or cascading `if-else` blocks on export format or calculation types. |
| **Liskov Substitution (LSP)** | - Application ports (`EmployeeReaderPort`, `CompensationRepositoryPort`) define strict behavioral contracts honoured by mock test adapters and JPA persistence adapters alike. | Persistence adapters throwing unexpected runtime exceptions not declared in domain/application port contracts. |
| **Interface Segregation (ISP)** | - `EmployeeReaderPort` (read-only queries) separated from `EmployeeWriterPort` (mutations).<br>- Other modules (e.g. `compensation`) only inject `EmployeeReaderPort`, preventing accidental employee modifications. | Megalithic `EmployeeService` interface exposing 30 unrelated methods to client modules. |
| **Dependency Inversion (DIP)** | - Domain and Application layers depend strictly on abstract ports, never on Spring Data JPA, Hibernate, or HTTP servlets.<br>- Spring configuration injects adapters into application services via constructor injection. | Domain entities annotated with Hibernate `@Entity` or importing `org.springframework.*`. |

### 2.3 ArchUnit Automated Architecture Rules
The following test rules will be compiled into `src/test/java/com/acme/compensation/architecture/ArchitectureTest.java`:

```java
// Rule 1: Clean Architecture Layer Dependency Direction
layeredArchitecture()
    .consideringAllDependencies()
    .layer("Domain").definedBy("..domain..")
    .layer("Application").definedBy("..application..")
    .layer("Infrastructure").definedBy("..infrastructure..")
    .layer("Api").definedBy("..api..")
    .whereLayer("Domain").mayOnlyBeAccessedByLayers("Application", "Infrastructure", "Api")
    .whereLayer("Application").mayOnlyBeAccessedByLayers("Infrastructure", "Api")
    .whereLayer("Infrastructure").mayNotBeAccessedByAnyLayer()
    .whereLayer("Api").mayNotBeAccessedByAnyLayer();

// Rule 2: Module Boundary Isolation
// Compensation must NEVER access Employee's internal infrastructure or JPA repositories
noClasses().that().resideInAPackage("..compensation..")
    .should().dependOnClassesThat().resideInAnyPackage(
        "..employee.infrastructure..",
        "..employee.domain.model.EmployeeEntity.."
    );

// Rule 3: Controllers must NEVER inject Repositories directly
noClasses().that().resideInAPackage("..api..")
    .should().dependOnClassesThat().resideInAnyPackage("..infrastructure.persistence..");
```

---

## 3. Effective-Dated Compensation & Temporal Integrity

### 3.1 Temporal Validity Model
A compensation record represents an immutable economic agreement covering a defined date interval:
`[effective_from, effective_to]`.

```
Historical Record:  [2024-01-01 -> 2024-12-31]  (effective_to < CURRENT_DATE)
Current Record:     [2025-01-01 -> 2026-12-31]  (effective_from <= CURRENT_DATE AND (effective_to IS NULL OR effective_to >= CURRENT_DATE))
Future Record:      [2027-01-01 -> NULL]        (effective_from > CURRENT_DATE)
```

> **The `effective_to IS NULL` Trap**:  
> In systems that assume the "current" record is always the one where `effective_to IS NULL`, scheduling a future salary revision (e.g., effective next quarter) with `effective_to = NULL` will instantly make the future revision appear as the current salary!
>
> **Mandatory Rule**:
> - **Current Active Compensation Query**:
>   ```sql
>   SELECT * FROM compensation 
>   WHERE employee_id = :employeeId 
>     AND effective_from <= CURRENT_DATE 
>     AND (effective_to IS NULL OR effective_to >= CURRENT_DATE)
>   ORDER BY effective_from DESC 
>   LIMIT 1;
>   ```
> - **Latest Scheduled Compensation Query** (for revisions):
>   The latest record chronologically, regardless of whether its `effective_from` is in the future.

### 3.2 Timeline Splitting & Revision Logic
When a revision is submitted with `new_effective_from = D`:
1. **Validation**:
   - `D` must not be before the employee's `joining_date`.
   - `base_salary > 0`, `bonus >= 0`.
   - ISO-4217 Currency must be valid.
2. **Locate Existing Interval**:
   - Find the existing record that currently encompasses date `D` (`effective_from <= D AND (effective_to IS NULL OR effective_to >= D)`).
   - If `effective_from == D`: Reject standard revision as date collision (or allow explicit correction mode); standard revision must advance or partition the timeline cleanly.
   - Set the encompassed record's `effective_to = D - 1 day`.
3. **Determine New Record's `effective_to`**:
   - Check if there exists a future scheduled revision with `effective_from > D`.
   - If a future record exists starting at `D_next`, new record gets `effective_to = D_next - 1 day`.
   - If no future record exists, new record gets `effective_to = NULL`.
4. **Insert New Compensation Record**:
   - Insert with `effective_from = D`, `effective_to = calculated_to`.

### 3.3 Database-Level Overlap Prevention (PostgreSQL btree_gist)
Application-level date checks cannot prevent race conditions under concurrent requests. We enforce a mathematical exclusion constraint at the PostgreSQL engine level:

```sql
-- Enable btree_gist extension for combining scalar and range types
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Prevent any overlapping date ranges for the same employee
ALTER TABLE compensation 
ADD CONSTRAINT chk_comp_no_overlapping_periods
EXCLUDE USING gist (
    employee_id WITH =,
    daterange(effective_from, COALESCE(effective_to, 'infinity'::date), '[]') WITH &&
);

-- Check constraint ensuring valid chronological bounds
ALTER TABLE compensation
ADD CONSTRAINT chk_comp_dates_order
CHECK (effective_to IS NULL OR effective_to >= effective_from);
```
If two concurrent transactions attempt to create overlapping intervals for employee 100, PostgreSQL will abort the offending transaction with a `exclusion_violation` (SQLSTATE `23P01`), which our `GlobalExceptionHandler` converts into an HTTP `409 Conflict`.

---

## 4. Concurrency Control & Atomic Transactions

### 4.1 Concurrency Hazard Analysis
If two HR Managers simultaneously revise compensation for Employee 42:
- Manager A sets salary to $120,000 effective 2026-11-01.
- Manager B sets salary to $125,000 effective 2026-11-01.
Without serialization, both read the current record, both attempt to close it, resulting in corrupt intervals or race conditions.

### 4.2 Concurrency Solution: Explicit Pessimistic Write Lock
In high-stakes compensation operations, optimistic locking can cause frustrating rollbacks for users. We implement **Pessimistic Locking** on the parent employee record during revision:

```java
@Transactional(isolation = Isolation.READ_COMMITTED)
public CompensationResponseDTO reviseCompensation(Long employeeId, ReviseCompensationCommand command, Long actorUserId, String actorEmail) {
    // 1. Acquire exclusive write lock on the employee row for the duration of this transaction
    EmployeeEntity employee = employeeJpaRepository.findByIdForUpdate(employeeId)
        .orElseThrow(() -> new ResourceNotFoundException("Employee", employeeId));

    // 2. Fetch compensation records in chronological order
    List<CompensationEntity> history = compensationJpaRepository.findByEmployeeIdOrderByEffectiveFromAsc(employeeId);
    
    // 3. Perform timeline slice logic & validation
    // ...
    
    // 4. Update previous record and save new record
    compensationJpaRepository.save(previousRecord);
    CompensationEntity savedNew = compensationJpaRepository.save(newRecord);

    // 5. Write immutable audit log within the SAME transaction
    SalaryAuditLogEntity auditLog = SalaryAuditLogEntity.builder()
        .employeeId(employeeId)
        .changedByUserId(actorUserId)
        .changedByEmail(actorEmail)
        .previousBaseSalary(previousRecord.getBaseSalary())
        .newBaseSalary(savedNew.getBaseSalary())
        .previousBonus(previousRecord.getBonus())
        .newBonus(savedNew.getBonus())
        .currency(savedNew.getCurrency())
        .changeReason(command.getReason())
        .effectiveDate(command.getEffectiveFrom())
        .changedAt(Instant.now())
        .build();
    auditLogJpaRepository.save(auditLog);

    return mapper.toDto(savedNew);
}
```

### 4.3 Atomicity Guarantee
Because `compensation` and `salary_audit_logs` are updated within the exact same Spring `@Transactional` context against the same PostgreSQL database:
- If audit persistence fails, compensation changes roll back completely.
- If the exclusion constraint rejects an overlapping range, the audit record is not written.
- Data consistency is 100% atomic.

---

## 5. Security & Authentication Integrity

### 5.1 Identity Extraction from SecurityContext
**Never trust client input for audit identity.** The client request body must only specify:
`{ newBaseSalary, newBonus, currency, effectiveFrom, reason }`.

The `actorUserId` and `actorEmail` are resolved strictly by the backend:
```java
@RestController
@RequestMapping("/api/v1/employees/{id}/compensation")
public class CompensationController {

    @PostMapping
    @PreAuthorize("hasAnyRole('HR_MANAGER', 'ADMIN')")
    public ResponseEntity<CompensationResponseDTO> reviseCompensation(
            @PathVariable Long id,
            @Valid @RequestBody ReviseCompensationRequest request,
            @AuthenticationPrincipal SecurityUserPrincipal principal) {
        
        CompensationResponseDTO response = salaryRevisionUseCase.revise(
            id, 
            request.toCommand(), 
            principal.getId(), 
            principal.getEmail()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
```

### 5.2 Access Control Rules
- `ROLE_HR_MANAGER`: Can view directory, view compensation, execute revisions, view audit history, run analytics, export CSV.
- `ROLE_ADMIN`: Full access including user administration and seed trigger.
- Unauthorized users / unauthenticated requests: HTTP `401 Unauthorized` or `403 Forbidden`.

---

## 6. Multi-Currency Analytics & Optimized Projections

### 6.1 Multi-Currency Aggregation Safety
Directly adding or averaging salaries across currencies (e.g. INR + USD + EUR) is statistically invalid. 
The system enforces:
1. **Strict Grouping**: All baseline analytics queries group by `currency` and `department`/`country`.
2. **Explicit Conversion Only**: If consolidated reporting is requested (e.g., "Total Global Payroll in USD"), the query joins with the `exchange_rates` table on the requested valuation date.

### 6.2 PostgreSQL Analytical Functions & Projections
To achieve sub-50ms analytics on 10,000+ employees, analytics are computed directly in PostgreSQL using indexed projections:

```sql
-- Fast, accurate median, average, min, max per department by currency
SELECT 
    e.department,
    c.currency,
    COUNT(e.id) AS employee_count,
    ROUND(AVG(c.base_salary), 2) AS avg_base_salary,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY c.base_salary) AS median_base_salary,
    MIN(c.base_salary) AS min_base_salary,
    MAX(c.base_salary) AS max_base_salary,
    ROUND(AVG(c.bonus), 2) AS avg_bonus,
    ROUND(AVG(c.base_salary + c.bonus), 2) AS avg_total_compensation
FROM employees e
JOIN compensation c ON e.id = c.employee_id
WHERE e.employment_status = 'ACTIVE'
  AND c.effective_from <= CURRENT_DATE
  AND (c.effective_to IS NULL OR c.effective_to >= CURRENT_DATE)
GROUP BY e.department, c.currency
ORDER BY e.department, c.currency;
```
This is mapped cleanly into a read-only Spring Data JPA interface projection (`DepartmentSalaryStatsProjection`), completely avoiding entity hydration in memory.

---

## 7. Deterministic 10,000 Employee Seed Engine

### 7.1 Seed Execution Architecture
Automatic seed data generation during every application reboot causes slow startup times, duplicate data risks, and unpredictable test states.

**Design Strategy**:
- Seed data generation is encapsulated in a dedicated service `SeedDataService`.
- Executed via:
  1. CLI Flag: `--seed-data=true` on application launch, OR
  2. Protected Admin API: `POST /api/v1/admin/seed-data?force=false`.
- **Idempotency Guard**:
  ```java
  long count = employeeJpaRepository.count();
  if (count >= 10000 && !force) {
      log.info("Database already contains {} employees. Skipping seed.", count);
      return;
  }
  ```

### 7.2 Determinism & Batch Performance
- Generator uses `new Random(42L)` for deterministic generation of identical employee records across runs.
- Utilizes Spring `JdbcTemplate.batchUpdate` with batch size 1,000 to insert 10,000 employees and ~13,000 compensation records in < 3 seconds.
- Verifies post-condition: Exactly 10,000 employee records in PostgreSQL.

---

## 8. Realistic Microservice Extraction Strategy & Trade-Offs

> **No "Zero-Rework" Microservice Extraction Exists**:  
> Claiming a modular monolith can be transformed into microservices with "zero rework" is an architectural anti-pattern. While our modular design decouples business logic, extracting physical services introduces fundamental distributed systems challenges.

### Concrete Extraction Roadmaps & Friction Analysis

```
+-------------------------------------------------------------------------+
|                        CURRENT: MODULAR MONOLITH                        |
|                                                                         |
|  [ Employee Module ]  [ Compensation Module ]  [ Analytics / Audit ]    |
|             \                   |                   /                   |
|              +------------------+------------------+                    |
|                                 |                                       |
|                    Single PostgreSQL Database                           |
|       (ACID Transactions, Foreign Keys, Exclusion Constraints)          |
+-------------------------------------------------------------------------+
                                    |
                                    v (Future Extraction)
+-------------------------------------------------------------------------+
|                      FUTURE: EXTRACTED MICROSERVICES                    |
|                                                                         |
|  [ Employee Service ]       [ Compensation Service ]  [ Audit Service ] |
|         |                            |                       |          |
|    Employee DB               Compensation DB              Audit DB      |
|         \                            /                       |          |
|          +--- Kafka / Outbox Events +------------------------+          |
|                                                                         |
|   REQUIRED REWORK:                                                      |
|   1. Remove DB Foreign Keys (compensation.employee_id -> employees.id)  |
|   2. Replace ACID revision+audit transaction with Transactional Outbox  |
|   3. Replace DB joins in Analytics with CQRS Read Model / Kafka sync    |
|   4. Add API Gateway, Distributed Tracing, Circuit Breakers             |
+-------------------------------------------------------------------------+
```

### Breakdown of Specific Extraction Friction:
1. **Loss of Relational Foreign Keys**:
   - Monolith: `compensation.employee_id` references `employees(id)` with `ON DELETE RESTRICT`.
   - Microservices: In separate databases, foreign keys are impossible. Compensation Service must validate `employeeId` via an HTTP/gRPC call or cached local replica, handling eventual consistency.
2. **Loss of Atomic Cross-Module Transactions**:
   - Monolith: Salary update and audit log write share a single PostgreSQL ACID transaction.
   - Microservices: Requires implementing the **Transactional Outbox Pattern** in Compensation Service, publishing a `CompensationRevisedEvent` via Kafka/RabbitMQ, and an asynchronous consumer in Audit Service. Failure handling requires compensating transactions or dead-letter queues.
3. **Analytics Query Degradation**:
   - Monolith: Fast SQL join between `employees` (department, country) and `compensation` (salary, currency).
   - Microservices: Cross-database joins are impossible. Analytics Service must become a dedicated **CQRS Read Model** subscribing to events from both Employee and Compensation services to build a denormalized reporting table.

---

## 9. Identified Edge Cases, Vulnerabilities & Mitigations

| Category | Identified Risk / Edge Case | Architectural Mitigation |
|---|---|---|
| **Data Integrity** | Revision effective date prior to employee joining date. | Enforce business rule validation: `effectiveFrom >= employee.joiningDate`. |
| **Data Integrity** | Revisions for inactive/terminated employees. | Require `employmentStatus == ACTIVE` (or `ON_LEAVE`) to revise salary; reject for `TERMINATED`. |
| **Security** | CSV Formula Injection (Excel interprets `=`, `+`, `-`, `@` as formulas). | Sanitize all exported CSV text fields: prefix vulnerable characters with a single quote `'`. |
| **Security** | Over-privileged access to compensation APIs. | Role-based `@PreAuthorize("hasRole('HR_MANAGER') or hasRole('ADMIN')")` on all compensation and audit routes. |
| **Performance** | Memory exhaustion from exporting 10,000 records. | Use Spring Web MVC streaming / `StreamingResponseBody` writing directly to servlet output stream in chunks of 500 records. |
| **Performance** | High-cardinality search leading to table scans. | Composite B-Tree indexes on `employees(country, department, employment_status)` and GIN / trigram indexes on `first_name`, `last_name`, `email`. |
| **Currency** | Currency change upon country relocation. | Support currency change during revision; mandate a reason (e.g., "International Relocation") and validate target currency against standard ISO list. |

---

## 10. Prioritized Architecture Action Plan

Before writing application code, the following architectural steps must be executed:

1. **Step 1: Document Approvals & Baseline**:
   - Published as `docs/architecture-review.md`.
2. **Step 2: Database Migration Definition**:
   - Script `V1__init_schema.sql` including `btree_gist` extension, exclusion constraint `chk_comp_no_overlapping_periods`, explicit CHECK constraints, and optimized indexes.
3. **Step 3: ArchUnit Rules Setup**:
   - Create foundational architecture test suite to continuously validate Clean Architecture rules across all commits.
4. **Step 4: Core Implementation (Incremental & Tested)**:
   - Module 1: `shared` & `security` (JWT, UserDetails, SecurityContext).
   - Module 2: `employee` (Clean Arch, CRUD, Search, CSV Streaming).
   - Module 3: `compensation` & `audit` (Atomic revision, pessimistic locking, exclusion constraint handling, audit logging).
   - Module 4: `analytics` (Optimized native projections, multi-currency segregation, true median calculation).
   - Module 5: `seed` (Deterministic, batch-inserted, idempotent 10,000 employee engine).
5. **Step 5: Frontend SaaS Experience**:
   - React + Vite + TypeScript + Tailwind CSS with TanStack Query and Lucide icons.
   - Comprehensive workflows: Overview, Directory, Profile, Revision Modal with validation, Analytics Explorer, Audit Log.
6. **Step 6: Quality Verification & End-to-End Testing**:
   - Unit tests, integration tests with PostgreSQL, architecture tests, frontend tests, and documented test coverage.
