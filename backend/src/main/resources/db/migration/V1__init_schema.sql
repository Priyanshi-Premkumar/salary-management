-- ACME CompensationOS: V1 Initial Schema
-- Enables btree_gist extension for temporal exclusion constraints
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- 1. Users table (Authentication and Authorization)
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Employees table
CREATE TABLE employees (
    id BIGSERIAL PRIMARY KEY,
    employee_code VARCHAR(30) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(50),
    country VARCHAR(60) NOT NULL,
    department VARCHAR(80) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    employment_status VARCHAR(30) NOT NULL,
    joining_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Compensation table (Effective-dated with PostgreSQL btree_gist exclusion constraint)
CREATE TABLE compensation (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
    base_salary DECIMAL(19,4) NOT NULL CHECK (base_salary > 0),
    bonus DECIMAL(19,4) NOT NULL DEFAULT 0.0000 CHECK (bonus >= 0),
    currency VARCHAR(3) NOT NULL,
    effective_from DATE NOT NULL,
    effective_to DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_comp_dates_order CHECK (effective_to IS NULL OR effective_to >= effective_from),
    CONSTRAINT chk_comp_no_overlapping_periods EXCLUDE USING gist (
        employee_id WITH =,
        daterange(effective_from, COALESCE(effective_to, 'infinity'::date), '[]') WITH &&
    )
);

-- 4. Salary Audit Logs table (Immutable audit trail)
CREATE TABLE salary_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
    changed_by BIGINT REFERENCES users(id),
    changed_by_email VARCHAR(150) NOT NULL,
    previous_base_salary DECIMAL(19,4) NOT NULL,
    new_base_salary DECIMAL(19,4) NOT NULL,
    previous_bonus DECIMAL(19,4) NOT NULL,
    new_bonus DECIMAL(19,4) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    change_reason TEXT NOT NULL,
    effective_date DATE NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Exchange Rates table (Optional consolidated reporting)
CREATE TABLE exchange_rates (
    id BIGSERIAL PRIMARY KEY,
    source_currency VARCHAR(3) NOT NULL,
    target_currency VARCHAR(3) NOT NULL,
    exchange_rate DECIMAL(19,6) NOT NULL,
    effective_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_currency_pair_date UNIQUE (source_currency, target_currency, effective_date)
);

-- Indexes for high-performance querying
CREATE INDEX idx_employees_code ON employees (employee_code);
CREATE INDEX idx_employees_email ON employees (email);
CREATE INDEX idx_employees_filters ON employees (country, department, employment_status);
CREATE INDEX idx_comp_lookup ON compensation (employee_id, effective_from, effective_to);
CREATE INDEX idx_comp_currency_active ON compensation (currency, effective_from, effective_to);
CREATE INDEX idx_audit_employee_time ON salary_audit_logs (employee_id, changed_at DESC);
CREATE INDEX idx_audit_changed_at ON salary_audit_logs (changed_at DESC);

-- Seed default exchange rates (Base: USD)
INSERT INTO exchange_rates (source_currency, target_currency, exchange_rate, effective_date) VALUES
('USD', 'USD', 1.000000, CURRENT_DATE),
('INR', 'USD', 0.012000, CURRENT_DATE),
('EUR', 'USD', 1.080000, CURRENT_DATE),
('GBP', 'USD', 1.300000, CURRENT_DATE),
('AED', 'USD', 0.272300, CURRENT_DATE)
ON CONFLICT DO NOTHING;
