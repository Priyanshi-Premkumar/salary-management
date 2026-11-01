# ACME CompensationOS: Demonstration & Evaluation Guide

**Application:** ACME CompensationOS  
**Target Users:** Evaluators, HR Leadership, Auditors  
**Access URL:** `http://localhost:5173` (Frontend) | `http://localhost:8080/swagger-ui.html` (Swagger API)

---

## 1. Demo Credentials

| Role | Email | Password | Permissions |
|---|---|---|---|
| **HR Manager** | `hrmanager@acme.com` | `Manager@123` | Employee CRUD, Revise Salary, View History, View Analytics, View Audit, Export CSV |
| **Administrator** | `admin@acme.com` | `Admin@123` | Full Access, Seed Data Trigger, System Management |

---

## 2. Key Evaluation Scenarios

### Scenario 1: Executive Analytics & Multi-Currency Integrity
1. Login as `hrmanager@acme.com`.
2. Observe Overview Dashboard:
   - Total Headcount: **10,000 Employees**.
   - Currency breakdown selector (INR, USD, GBP, EUR, AED).
   - Interactive charts: Department Distribution, Country Breakdown, Salary Bands.
3. Switch currency to **USD**: Observe that average and median salaries adapt cleanly without mixing currencies.

### Scenario 2: High-Performance Employee Directory & Search
1. Navigate to **Employees**.
2. Type `Sharma` into the instant search bar: Results filter in < 50ms across 10,000 records.
3. Filter by Country: `India` and Department: `Engineering`.
4. Click **Export CSV**: Verify clean download containing filtered records with formula injection sanitization.

### Scenario 3: Salary Revision with Atomic Audit Logging
1. Click on an employee (e.g. `EMP-00101`).
2. Review Current Compensation card ($120,000 Base, $15,000 Bonus).
3. Click **Revise Compensation**:
   - Enter New Base Salary: `135000` (+12.5%).
   - Enter New Bonus: `20000`.
   - Enter Effective Date: `2026-11-01`.
   - Select Reason: `Annual Merit & Promotion`.
   - Notice the live delta calculator showing `+$15,000 (+12.5%)`.
4. Click **Review & Confirm Revision**: Modal displays confirmation summary.
5. Click **Submit Revision**:
   - Profile updates immediately.
   - Historical timeline displays previous compensation closed at `2026-10-31`.
   - Navigate to **Audit History**: Verify new immutable audit log recorded with your email, previous/new salary, and reason.

### Scenario 4: Concurrency & Overlap Protection
1. Attempt to submit a revision with an effective date that conflicts with an existing locked window:
   - System displays an intuitive conflict alert; database exclusion constraint prevents corrupt date ranges.

### Scenario 5: Answering Executive Business Questions
Navigate to **Analytics Explorer**:
- *Which department has the highest median salary?* (Instant bar chart comparison).
- *What is the compensation distribution in India?* (Country drilldown).
- *How many employees earn above a selected threshold?* (Dynamic threshold slider).
