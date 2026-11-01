package com.acme.compensation.shared.port;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collection;
import java.util.Map;
import java.util.Optional;

public interface CompensationLookupPort {

    record ActiveCompensationSummary(
            Long employeeId,
            BigDecimal baseSalary,
            BigDecimal bonus,
            String currency,
            LocalDate effectiveFrom
    ) {}

    Optional<ActiveCompensationSummary> findActiveCompensation(Long employeeId);

    Map<Long, ActiveCompensationSummary> findActiveCompensationForEmployees(Collection<Long> employeeIds);
}
