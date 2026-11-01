package com.acme.compensation.compensation.domain;

import com.acme.compensation.shared.domain.CurrencyCode;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder(toBuilder = true)
public class Compensation {
    private final Long id;
    private final Long employeeId;
    private final BigDecimal baseSalary;
    private final BigDecimal bonus;
    private final CurrencyCode currency;
    private final LocalDate effectiveFrom;
    private final LocalDate effectiveTo;

    public BigDecimal getTotalCompensation() {
        return baseSalary.add(bonus != null ? bonus : BigDecimal.ZERO);
    }

    public boolean isCurrentlyActive(LocalDate asOfDate) {
        boolean afterStart = !asOfDate.isBefore(effectiveFrom);
        boolean beforeEnd = (effectiveTo == null || !asOfDate.isAfter(effectiveTo));
        return afterStart && beforeEnd;
    }
}
