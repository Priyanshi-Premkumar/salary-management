# ACME CompensationOS: Architecture Principles & SOLID Compliance Guide

**Target System:** ACME CompensationOS  
**Core Principles:** SOLID, Clean Architecture, Dependency Inversion, Modular Monolith

---

## 1. Clean Architecture Layer Responsibilities

The codebase organizes packages with dependency arrows pointing strictly inward:

```
Api Layer (Controllers, Web Adapters, Envelopes)
    │
    ▼
Application Layer (Use Cases, Ports, Services, DTOs)
    ▲
    │
Infrastructure Layer (JPA Repositories, DB Adapters, External Clients)
    │
    ▼ (Depends on Application Ports)
Domain Layer (Pure Models, Value Objects, Business Exceptions)
```

1. **Domain Layer**:
   - Zero framework dependencies (no Spring, no Hibernate).
   - Contains business logic, value objects (e.g. `Money`, `CurrencyCode`), and domain exceptions (`InvalidSalaryException`).
2. **Application Layer**:
   - Contains driving ports (Use Cases) and driven ports (SPIs).
   - Coordinates business transactions (e.g., `SalaryRevisionService`).
   - Defines request/response DTOs.
3. **Infrastructure Layer**:
   - Implements SPI driven ports using Spring Data JPA, Hibernate, and JDBC.
   - Encapsulates database tables, JPA entities, and Flyway scripts.
4. **API Layer**:
   - Spring MVC REST Controllers.
   - Request mapping, validation (`@Valid`), HTTP status codes, and OpenAPI documentation.

---

## 2. SOLID Implementation in Code

### Single Responsibility Principle (SRP)
- Each class has one and only one reason to change.
- **Example**:
  - `SalaryRevisionService`: Responsible *only* for the revision transaction workflow.
  - `CompensationQueryService`: Responsible *only* for historical reads and active compensation lookups.
  - `CsvExportService`: Responsible *only* for streaming CSV generation.

### Open/Closed Principle (OCP)
- System behavior can be extended without modifying existing core code.
- **Example**:
  - `ExportFormatStrategy` allows adding Excel or JSON formatters without altering export controllers.
  - Pluggable analytics metrics through Strategy interfaces.

### Liskov Substitution Principle (LSP)
- Subtypes must be substitutable for their abstractions without altering program correctness.
- **Example**:
  - `EmployeeReaderPort` contract is honoured identically whether implemented by `JpaEmployeePersistenceAdapter` or a test mock stub.

### Interface Segregation Principle (ISP)
- Clients should not be forced to depend upon interfaces they do not use.
- **Example**:
  - Segregating `EmployeeReaderPort` (`findById`, `existsById`) from `EmployeeWriterPort` (`save`, `update`).
  - The `Compensation` module only imports `EmployeeReaderPort`, preventing accidental employee modifications.

### Dependency Inversion Principle (DIP)
- High-level modules do not depend on low-level modules; both depend upon abstractions.
- **Example**:
  - `SalaryRevisionService` depends on `CompensationRepositoryPort` and `SalaryAuditWriterPort` interfaces.
  - Spring DI injects the concrete JPA persistence adapters at runtime.

---

## 3. ArchUnit Verification Suite
Automated ArchUnit tests (`ArchitectureTest.java`) ensure architectural rules are verified on every test execution:
1. `layeredArchitecture()` validates Clean Architecture layers.
2. `no_cross_module_internal_access()` validates module boundaries.
3. `controllers_should_not_depend_on_repositories()` enforces separation of concerns.
