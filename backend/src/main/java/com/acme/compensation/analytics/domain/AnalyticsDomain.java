package com.acme.compensation.analytics.domain;

import java.math.BigDecimal;

public class AnalyticsDomain {

    public record DepartmentSalaryStats(
            String department,
            String currency,
            Long employeeCount,
            BigDecimal avgBaseSalary,
            BigDecimal medianBaseSalary,
            BigDecimal minBaseSalary,
            BigDecimal maxBaseSalary,
            BigDecimal avgBonus,
            BigDecimal avgTotalCompensation
    ) {}

    public record CountrySalaryStats(
            String country,
            String currency,
            Long employeeCount,
            BigDecimal avgBaseSalary,
            BigDecimal medianBaseSalary,
            BigDecimal totalPayroll
    ) {}
}
