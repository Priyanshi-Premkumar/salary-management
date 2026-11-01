package com.acme.compensation.audit.domain;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder(toBuilder = true)
public class SalaryAuditLog {
    private final Long id;
    private final Long employeeId;
    private final Long changedBy;
    private final String changedByEmail;
    private final BigDecimal previousBaseSalary;
    private final BigDecimal newBaseSalary;
    private final BigDecimal previousBonus;
    private final BigDecimal newBonus;
    private final String currency;
    private final String changeReason;
    private final LocalDate effectiveDate;
    private final Instant changedAt;
}
