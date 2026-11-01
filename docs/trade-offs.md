# ACME CompensationOS: Architectural Trade-Offs & Decision Records (ADRs)

---

## 1. Modular Monolith vs Microservices

### Decision:
Implement ACME CompensationOS as a **Microservice-Ready Modular Monolith**.

### Context & Drivers:
- Organization scale: 10,000 employees. Total database size is modest (< 100 MB).
- Compensation workflows require strict transactional atomicity between salary revisions and audit logs.
- A small team needs rapid deployment, straightforward local development, and simple operations.

### Trade-Off Analysis:
| Dimension | Modular Monolith (Chosen) | Microservices (Alternative) |
|---|---|---|
| **Transactional Integrity** | Local ACID transactions guarantee 100% atomic audit logging and salary updates. | Requires distributed transactions (2PC, Saga) or Transactional Outbox pattern with eventual consistency. |
| **Operational Overhead** | Single container deployment, 1 database instance, zero network service meshes. | Multiple CI/CD pipelines, Kubernetes, service discovery, API gateways, distributed tracing. |
| **Data Integrity** | Relational foreign keys and exclusion constraints (`btree_gist`) enforced at engine level. | Relational integrity cannot cross database boundaries; application-level reconciliation required. |
| **Query Complexity** | Single SQL query joins `employees` and `compensation` in < 2ms for analytics. | Impossible cross-DB joins; requires CQRS event streaming (Kafka/Debezium) and duplicate read datastores. |
| **Microservice Readiness** | Decoupled domain packages, ports & adapters, zero shared mutable entities. | Already separated, but with high distributed overhead. |

### Documented Extraction Effort (Honest Assessment):
If ACME expands to 500,000 employees and extracts `Compensation Service`:
1. Database splitting requires removing foreign keys (`compensation.employee_id -> employees.id`).
2. Audit logging must transition to an asynchronous Transactional Outbox with Kafka event publishing.
3. Analytics must be re-architected as a dedicated CQRS Read Model.

---

## 2. Concurrency Control: Pessimistic vs Optimistic Locking

### Decision:
Use **Pessimistic Write Locking** (`SELECT ... FOR UPDATE` on employee record) for salary revisions.

### Rationale:
- In financial/salary operations, optimistic lock rollbacks (`OptimisticLockException`) frustrate HR managers who spent minutes crafting complex compensation revisions.
- Locking an individual employee row serializes concurrent revisions for that specific employee with zero system-wide contention (employee rows are independent).
- Application-level pessimistic locking coupled with PostgreSQL `btree_gist` exclusion constraints guarantees zero overlapping date ranges.

---

## 3. Analytics Architecture: Database SQL vs In-Memory Java Processing

### Decision:
Execute aggregations and statistical calculations directly in PostgreSQL using native functions (`PERCENTILE_CONT(0.5)`) and read-only Spring Data projections.

### Rationale:
- Fetching 10,000 employee entities into Java heap memory creates excessive GC pressure, increases latency to seconds, and wastes bandwidth.
- PostgreSQL computes counts, medians, and averages in < 15ms using composite indexes, returning lightweight DTOs directly to the API layer.

---

## 4. Database Evolution: Flyway vs Hibernate `ddl-auto`

### Decision:
Use **Flyway 10.x** migrations and disable Hibernate automatic schema creation (`ddl-auto: validate`).

### Rationale:
- Hibernate auto-DDL cannot generate advanced PostgreSQL features such as `btree_gist` exclusion constraints or partial indexes.
- Flyway migrations are version-controlled, reproducible, reviewable in PRs, and safe for production deployments.
