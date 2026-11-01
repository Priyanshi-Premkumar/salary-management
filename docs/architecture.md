# ACME CompensationOS: High-Level Architecture & System Design

**System:** ACME CompensationOS  
**Architecture Style:** Microservice-Ready Modular Monolith  
**Runtime:** Spring Boot 3.3.x (Java 21+) & React 18 (Vite + TypeScript)  
**Database:** PostgreSQL 16 (Relational & Temporal)

---

## 1. High-Level Architecture (HLD)

```mermaid
graph TD
    User["HR Manager / Admin Browser"]
    
    subgraph Frontend["React Frontend (SPA)"]
        Router["React Router v6"]
        QueryCache["TanStack Query Cache"]
        Pages["Pages (Dashboard, Employees, Comp, Analytics, Audit)"]
        UIComp["Tailwind CSS + Recharts + Lucide UI"]
    end
    
    subgraph Backend["Spring Boot 3 Modular Monolith"]
        SecurityGateway["Spring Security + JWT Auth Filter"]
        
        subgraph EmployeeModule["Employee Module"]
            EmpCtrl["Employee Controller"]
            EmpSvc["Employee Service"]
            EmpRepo["Employee Persistence Adapter"]
        end
        
        subgraph CompModule["Compensation Module"]
            CompCtrl["Compensation Controller"]
            CompSvc["Salary Revision Service"]
            CompRepo["Compensation Persistence Adapter"]
        end
        
        subgraph AnalyticsModule["Analytics Module"]
            AnaCtrl["Analytics Controller"]
            AnaSvc["Analytics Service"]
            AnaRepo["SQL Projection Repository"]
        end
        
        subgraph AuditModule["Audit Module"]
            AudCtrl["Audit Controller"]
            AudSvc["Salary Audit Service"]
            AudRepo["Audit Persistence Adapter"]
        end
        
        subgraph SecurityModule["Security & Auth Module"]
            AuthCtrl["Auth Controller"]
            UserSvc["UserDetailsService / JwtProvider"]
        end
    end
    
    subgraph Database["PostgreSQL 16"]
        T_Users[("users")]
        T_Employees[("employees")]
        T_Comp[("compensation (btree_gist exclusion)")]
        T_Audit[("salary_audit_logs")]
        T_Rates[("exchange_rates")]
    end
    
    User -->|HTTPS / REST API| SecurityGateway
    SecurityGateway --> AuthCtrl
    SecurityGateway --> EmpCtrl
    SecurityGateway --> CompCtrl
    SecurityGateway --> AnaCtrl
    SecurityGateway --> AudCtrl
    
    EmpCtrl --> EmpSvc --> EmpRepo --> T_Employees
    CompCtrl --> CompSvc
    CompSvc -->|Pessimistic Lock| EmpRepo
    CompSvc --> CompRepo --> T_Comp
    CompSvc -->|Atomic Log| AudSvc --> AudRepo --> T_Audit
    AnaCtrl --> AnaSvc --> AnaRepo --> Database
    AuthCtrl --> UserSvc --> T_Users
```

---

## 2. Module Responsibilities & Public Contracts

| Module | Core Responsibility | Public Interface / Contract | Internal Persistence |
|---|---|---|---|
| **`security`** | User authentication, JWT issuance, password hashing | `SecurityContextHolder`, `UserDetailsService` | `users` table |
| **`employee`** | Employee directory, lifecycle status, CRUD | `EmployeeReaderPort` (`findById`, `existsById`) | `employees` table |
| **`compensation`** | Effective-dated salary management, revisions | `ReviseCompensationUseCase`, `CompensationQueryPort` | `compensation` table |
| **`audit`** | Immutable salary revision compliance logging | `SalaryAuditWriterPort` | `salary_audit_logs` table |
| **`analytics`** | Database-optimized statistical calculations | `AnalyticsQueryPort` | Direct read projections |

### Inter-Module Communication Rule
- Modules communicate exclusively via Java Interfaces (Ports) and DTOs.
- `Compensation` never references `EmployeeEntity` or imports JPA repositories from `employee`.
- Modules share zero mutable entities.

---

## 3. Database-Level Temporal & Concurrency Architecture

### 3.1 Overlap Prevention with `btree_gist`
PostgreSQL prevents overlapping date slices for any employee via an exclusion constraint:
```sql
ALTER TABLE compensation ADD CONSTRAINT chk_comp_no_overlapping_periods
EXCLUDE USING gist (
    employee_id WITH =,
    daterange(effective_from, COALESCE(effective_to, 'infinity'::date), '[]') WITH &&
);
```

### 3.2 Pessimistic Write Lock Sequence
```mermaid
sequenceDiagram
    autonumber
    HR->>CompController: POST /api/v1/employees/{id}/compensation
    CompController->>SalaryRevisionService: revise(command, actor)
    Note over SalaryRevisionService: @Transactional boundary begins
    SalaryRevisionService->>EmployeeRepository: findByIdForUpdate(employeeId)
    Note over EmployeeRepository: SELECT ... FOR UPDATE (Row Locked)
    SalaryRevisionService->>CompensationRepository: findChronological(employeeId)
    SalaryRevisionService->>CompensationRepository: closePreviousRecord(effective_to)
    SalaryRevisionService->>CompensationRepository: save(newCompensation)
    SalaryRevisionService->>AuditService: recordAudit(log)
    Note over SalaryRevisionService: @Transactional boundary commits atomically
    SalaryRevisionService-->>CompController: CompensationDTO
    CompController-->>HR: 201 Created
```

---

## 4. Multi-Currency Strategy
1. **Zero Currency Mixed Aggregation**: Direct summation or averaging across disparate currencies is prohibited in application code and SQL.
2. **Explicit Grouping**: All aggregate queries group by `currency` and `department`/`country`.
3. **Consolidated Valuation (Optional)**: If a unified reporting currency is selected, rates are pulled from the `exchange_rates` table on the valuation date.
