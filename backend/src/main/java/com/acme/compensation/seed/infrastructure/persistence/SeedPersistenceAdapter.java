package com.acme.compensation.seed.infrastructure.persistence;

import com.acme.compensation.seed.application.port.out.SeedRepositoryPort;
import java.sql.Date;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class SeedPersistenceAdapter implements SeedRepositoryPort {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public long getEmployeeCount() {
        Long count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM employees", Long.class);
        return count != null ? count : 0L;
    }

    @Override
    @Transactional
    public void cleanAllData() {
        log.info("Truncating employees, compensation, and salary_audit_logs tables...");
        jdbcTemplate.execute("TRUNCATE TABLE salary_audit_logs, compensation, employees RESTART IDENTITY CASCADE");
    }

    @Override
    @Transactional
    public void insertUsersIfNotExist(List<SeedUserRecord> users) {
        String sql = "INSERT INTO users (email, password_hash, role, active, created_at) " +
                     "VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP) " +
                     "ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash";

        List<Object[]> batchArgs = new ArrayList<>();
        for (SeedUserRecord u : users) {
            batchArgs.add(new Object[]{u.email(), u.passwordHash(), u.role(), u.active()});
        }
        jdbcTemplate.batchUpdate(sql, batchArgs);
    }

    @Override
    public Long findUserIdByEmail(String email) {
        try {
            return jdbcTemplate.queryForObject("SELECT id FROM users WHERE email = ?", Long.class, email);
        } catch (EmptyResultDataAccessException e) {
            return null;
        }
    }

    @Override
    @Transactional
    public void batchInsertEmployees(List<SeedEmployeeRecord> employees) {
        String sql = "INSERT INTO employees (id, employee_code, first_name, last_name, email, phone, " +
                     "country, department, designation, employment_status, joining_date, created_at, updated_at) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)";

        List<Object[]> batchArgs = new ArrayList<>(employees.size());
        for (SeedEmployeeRecord e : employees) {
            batchArgs.add(new Object[]{
                    e.id(),
                    e.employeeCode(),
                    e.firstName(),
                    e.lastName(),
                    e.email(),
                    e.phone(),
                    e.country(),
                    e.department(),
                    e.designation(),
                    e.employmentStatus(),
                    Date.valueOf(e.joiningDate())
            });
        }

        executeInChunks(sql, batchArgs, 1000);
    }

    @Override
    @Transactional
    public void batchInsertCompensations(List<SeedCompensationRecord> compensations) {
        String sql = "INSERT INTO compensation (employee_id, base_salary, bonus, currency, effective_from, effective_to, created_at, updated_at) " +
                     "VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)";

        List<Object[]> batchArgs = new ArrayList<>(compensations.size());
        for (SeedCompensationRecord c : compensations) {
            batchArgs.add(new Object[]{
                    c.employeeId(),
                    c.baseSalary(),
                    c.bonus(),
                    c.currency(),
                    Date.valueOf(c.effectiveFrom()),
                    c.effectiveTo() != null ? Date.valueOf(c.effectiveTo()) : null
            });
        }

        executeInChunks(sql, batchArgs, 1000);
    }

    @Override
    @Transactional
    public void batchInsertAuditLogs(List<SeedAuditLogRecord> auditLogs) {
        String sql = "INSERT INTO salary_audit_logs (employee_id, changed_by, changed_by_email, " +
                     "previous_base_salary, new_base_salary, previous_bonus, new_bonus, currency, " +
                     "change_reason, effective_date, changed_at) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        List<Object[]> batchArgs = new ArrayList<>(auditLogs.size());
        for (SeedAuditLogRecord a : auditLogs) {
            batchArgs.add(new Object[]{
                    a.employeeId(),
                    a.changedBy(),
                    a.changedByEmail(),
                    a.previousBaseSalary(),
                    a.newBaseSalary(),
                    a.previousBonus(),
                    a.newBonus(),
                    a.currency(),
                    a.changeReason(),
                    Date.valueOf(a.effectiveDate()),
                    Timestamp.from(a.changedAt())
            });
        }

        executeInChunks(sql, batchArgs, 1000);
    }

    @Override
    public void updateSequences() {
        jdbcTemplate.execute("SELECT setval('employees_id_seq', COALESCE((SELECT MAX(id) FROM employees), 1))");
        jdbcTemplate.execute("SELECT setval('compensation_id_seq', COALESCE((SELECT MAX(id) FROM compensation), 1))");
        jdbcTemplate.execute("SELECT setval('salary_audit_logs_id_seq', COALESCE((SELECT MAX(id) FROM salary_audit_logs), 1))");
    }

    private void executeInChunks(String sql, List<Object[]> batchArgs, int chunkSize) {
        for (int i = 0; i < batchArgs.size(); i += chunkSize) {
            int end = Math.min(i + chunkSize, batchArgs.size());
            List<Object[]> subList = batchArgs.subList(i, end);
            jdbcTemplate.batchUpdate(sql, subList);
        }
    }
}
