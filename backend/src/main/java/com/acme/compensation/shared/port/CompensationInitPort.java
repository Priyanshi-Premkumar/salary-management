package com.acme.compensation.shared.port;

import java.math.BigDecimal;
import java.time.LocalDate;

public interface CompensationInitPort {
    void initializeCompensation(Long employeeId, BigDecimal baseSalary, BigDecimal bonus, String currency, LocalDate effectiveFrom);
}
