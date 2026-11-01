# ACME CompensationOS: Testing Strategy & Quality Assurance Plan

---

## 1. Test Pyramid & Automation Levels

```
           / \
          /   \     E2E / Workflow Tests (Playwright / Cypress)
         /-----\
        /       \    Frontend Component Tests (Vitest + RTL)
       /---------\
      /           \   Backend Integration Tests (SpringBootTest + Testcontainers / PostgreSQL)
     /-------------\
    /               \  Architecture Tests (ArchUnit Rules)
   /-----------------\
  /                   \ Backend Unit Tests (JUnit 5 + Mockito)
 /---------------------\
```

---

## 2. Architecture Tests (`ArchitectureTest.java`)
Using **ArchUnit 1.3.x**:
1. **Clean Architecture Layering**:
   - `Domain` is independent of Spring, JPA, Web, and Infrastructure.
   - `Application` depends only on `Domain`.
   - `Infrastructure` implements `Application` ports.
   - `Api` controllers depend only on Application ports.
2. **Module Boundaries**:
   - `compensation` cannot import `employee.infrastructure` or `EmployeeEntity`.
   - `audit` cannot be bypassed by other modules.
3. **Controller Isolation**:
   - No controller may inject a Spring Data Repository directly.

---

## 3. Backend Unit Tests
- `EmployeeServiceTest`: Validation, duplication rejection, pagination edge cases.
- `SalaryRevisionServiceTest`:
  - Enforces positive salary (`baseSalary > 0`).
  - Enforces non-negative bonus (`bonus >= 0`).
  - Enforces valid ISO-4217 currency.
  - Slices existing compensation interval and sets `effective_to`.
  - Atomically constructs `SalaryAuditLog`.
- `AnalyticsServiceTest`:
  - Verifies multi-currency calculations are separated.
  - Verifies exact median and average formulas.

---

## 4. Backend Integration Tests
- `EmployeeControllerIntegrationTest`: Full HTTP request-response cycle, pagination, filtering.
- `CompensationRevisionIntegrationTest`: Executes revisions against PostgreSQL, verifies exclusion constraint behavior, and verifies database audit records.
- `ConcurrencyIntegrationTest`: Spawns concurrent threads attempting to update the same employee's salary to verify pessimistic locking and exclusion constraints.
- `SeedDataVerificationTest`: Asserts that exactly 10,000 employees are present in PostgreSQL with correct relationships.

---

## 5. Frontend Tests
- **Vitest & React Testing Library**:
  - `Dashboard.test.tsx`: Renders KPI cards and charts with API data.
  - `EmployeeTable.test.tsx`: Tests search, filtering, and pagination controls.
  - `SalaryRevisionModal.test.tsx`: Tests Zod validation (positive numbers, required reason), percentage difference calculation, and confirmation step.
