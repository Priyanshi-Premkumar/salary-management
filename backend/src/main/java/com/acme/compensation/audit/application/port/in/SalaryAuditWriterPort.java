package com.acme.compensation.audit.application.port.in;

import java.math.BigDecimal;
import java.time.LocalDate;

public interface SalaryAuditWriterPort {

    void recordAudit(
            Long employeeId,
            Long changedByUserId,
            String changedByEmail,
            BigDecimal previousBaseSalary,
            BigDecimal newBaseSalary,
            BigDecimal previousBonus,
            BigDecimal newBonus,
            String currency,
            String changeReason,
            LocalDate effectiveDate
    );
}
