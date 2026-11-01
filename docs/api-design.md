# ACME CompensationOS: REST API Design & Specifications

**Base URL:** `/api/v1`  
**Authentication Scheme:** Bearer JWT in `Authorization` Header  
**Data Interchange:** `application/json` (Export: `text/csv`)

---

## 1. Authentication Endpoints

### 1.1 Login
- **Endpoint:** `POST /api/v1/auth/login`
- **Request Body:**
  ```json
  {
    "email": "hrmanager@acme.com",
    "password": "Manager@123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 2,
      "email": "hrmanager@acme.com",
      "role": "ROLE_HR_MANAGER"
    }
  }
  ```

### 1.2 Current User Info
- **Endpoint:** `GET /api/v1/auth/me`
- **Response (200 OK):** Returns authenticated user profile.

---

## 2. Employee Endpoints

### 2.1 Search & Filter Employees
- **Endpoint:** `GET /api/v1/employees`
- **Query Parameters:**
  - `page` (default: 0)
  - `size` (default: 20, max: 100)
  - `search` (text query matching name, code, or email)
  - `country` (India, USA, UK, Germany, UAE)
  - `department` (Engineering, Product, Sales, etc.)
  - `designation`
  - `status` (ACTIVE, ON_LEAVE, TERMINATED)
  - `sortBy` (id, lastName, department, country, joiningDate)
  - `sortDir` (asc, desc)
- **Response (200 OK):**
  ```json
  {
    "content": [
      {
        "id": 101,
        "employeeCode": "EMP-00101",
        "firstName": "Aarav",
        "lastName": "Sharma",
        "email": "aarav.sharma@acme.com",
        "phone": "+91-9876543210",
        "country": "India",
        "department": "Engineering",
        "designation": "Senior Software Engineer",
        "employmentStatus": "ACTIVE",
        "joiningDate": "2023-01-15",
        "currentBaseSalary": 1850000.0000,
        "currentBonus": 150000.0000,
        "currency": "INR"
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 10000,
    "totalPages": 500
  }
  ```

### 2.2 Get Employee by ID
- **Endpoint:** `GET /api/v1/employees/{id}`
- **Response (200 OK):** Returns detailed employee profile and active compensation.

### 2.3 Create Employee
- **Endpoint:** `POST /api/v1/employees`
- **Request Body:**
  ```json
  {
    "employeeCode": "EMP-10001",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@acme.com",
    "phone": "+1-555-0199",
    "country": "USA",
    "department": "Engineering",
    "designation": "Staff Engineer",
    "employmentStatus": "ACTIVE",
    "joiningDate": "2024-02-01",
    "initialBaseSalary": 165000.0000,
    "initialBonus": 20000.0000,
    "currency": "USD"
  }
  ```
- **Response (201 Created)**

### 2.4 Update Employee
- **Endpoint:** `PUT /api/v1/employees/{id}`
- **Response (200 OK)**

### 2.5 Export Employees CSV
- **Endpoint:** `GET /api/v1/employees/export`
- **Response (200 OK, `text/csv`)**: Filter-aware CSV streaming.

---

## 3. Compensation & Revisions Endpoints

### 3.1 Get Current Compensation
- **Endpoint:** `GET /api/v1/employees/{id}/compensation`
- **Response (200 OK):**
  ```json
  {
    "id": 501,
    "employeeId": 101,
    "baseSalary": 1850000.0000,
    "bonus": 150000.0000,
    "currency": "INR",
    "effectiveFrom": "2024-01-01",
    "effectiveTo": null
  }
  ```

### 3.2 Revise Compensation (Atomic Transaction)
- **Endpoint:** `POST /api/v1/employees/{id}/compensation`
- **Request Body:**
  ```json
  {
    "newBaseSalary": 2100000.0000,
    "newBonus": 200000.0000,
    "currency": "INR",
    "effectiveFrom": "2024-04-01",
    "reason": "Annual Performance Merit & Promotion"
  }
  ```
- **Response (201 Created)**: Returns updated active compensation.
- **Error (409 Conflict)**: If date overlaps with existing locked period.

### 3.3 Salary Revision History
- **Endpoint:** `GET /api/v1/employees/{id}/salary-history`
- **Response (200 OK):** Chronological list of historical, current, and future compensation records.

### 3.4 Export Compensation CSV
- **Endpoint:** `GET /api/v1/compensation/export`
- **Response (200 OK, `text/csv`)**

---

## 4. Analytics Endpoints

### 4.1 Overview Metrics
- **Endpoint:** `GET /api/v1/analytics/overview`
- **Response (200 OK):** Headcount stats, active/inactive counts, currency-specific totals.

### 4.2 Department Analytics
- **Endpoint:** `GET /api/v1/analytics/by-department`
- **Query Parameters:** `currency` (optional)
- **Response (200 OK):** Array of `{ department, currency, employeeCount, avgBaseSalary, medianBaseSalary, minBaseSalary, maxBaseSalary }`.

### 4.3 Country Analytics
- **Endpoint:** `GET /api/v1/analytics/by-country`

### 4.4 Salary Band Distribution
- **Endpoint:** `GET /api/v1/analytics/salary-distribution`
- **Query Parameters:** `currency=INR`

---

## 5. Audit Log Endpoints

### 5.1 Search Audit Logs
- **Endpoint:** `GET /api/v1/audit-logs`
- **Query Parameters:** `page`, `size`, `employeeId`, `startDate`, `endDate`
- **Response (200 OK):** Paginated audit history.

### 5.2 Export Audit Logs CSV
- **Endpoint:** `GET /api/v1/audit-logs/export`

---

## 6. Standard Error Response Structure
```json
{
  "timestamp": "2026-11-01T03:59:00Z",
  "status": 409,
  "error": "Conflict",
  "message": "Compensation period overlaps with an existing effective date window",
  "path": "/api/v1/employees/101/compensation"
}
```
