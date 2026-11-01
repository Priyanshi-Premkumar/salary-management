package com.acme.compensation.seed.application.port.out;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public interface SeedRepositoryPort {

    record SeedUserRecord(String email, String passwordHash, String role, boolean active) {}

    record SeedEmployeeRecord(
            long id,
            String employeeCode,
            String firstName,
            String lastName,
            String email,
            String phone,
            String country,
            String department,
            String designation,
            String employmentStatus,
            LocalDate joiningDate
    ) {}

    record SeedCompensationRecord(
            long employeeId,
            BigDecimal baseSalary,
            BigDecimal bonus,
            String currency,
            LocalDate effectiveFrom,
            LocalDate effectiveTo
    ) {}

    record SeedAuditLogRecord(
            long employeeId,
            Long changedBy,
            String changedByEmail,
            BigDecimal previousBaseSalary,
            BigDecimal newBaseSalary,
            BigDecimal previousBonus,
            BigDecimal newBonus,
            String currency,
            String changeReason,
            LocalDate effectiveDate,
            Instant changedAt
    ) {}

    long getEmployeeCount();

    void cleanAllData();

    void insertUsersIfNotExist(List<SeedUserRecord> users);

    Long findUserIdByEmail(String email);

    void batchInsertEmployees(List<SeedEmployeeRecord> employees);

    void batchInsertCompensations(List<SeedCompensationRecord> compensations);

    void batchInsertAuditLogs(List<SeedAuditLogRecord> auditLogs);

    void updateSequences();
}
