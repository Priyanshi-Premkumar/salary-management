package com.acme.compensation.analytics.application.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import lombok.*;

public class AnalyticsResponses {

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OverviewResponse {
        private long totalEmployees;
        private long activeEmployees;
        private long inactiveEmployees;
        private long totalRevisionsThisYear;
        private Map<String, CurrencySummary> currencySummaries;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CurrencySummary {
        private String currency;
        private long employeeCount;
        private BigDecimal totalBasePayroll;
        private BigDecimal averageBaseSalary;
        private BigDecimal medianBaseSalary;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DepartmentStatsResponse {
        private String department;
        private String currency;
        private Long employeeCount;
        private BigDecimal avgBaseSalary;
        private BigDecimal medianBaseSalary;
        private BigDecimal minBaseSalary;
        private BigDecimal maxBaseSalary;
        private BigDecimal avgBonus;
        private BigDecimal avgTotalCompensation;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CountryStatsResponse {
        private String country;
        private String currency;
        private Long employeeCount;
        private BigDecimal avgBaseSalary;
        private BigDecimal medianBaseSalary;
        private BigDecimal totalPayroll;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SalaryBandBucket {
        private String label;
        private BigDecimal min;
        private BigDecimal max;
        private long count;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SalaryBandResponse {
        private String currency;
        private List<SalaryBandBucket> buckets;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ThresholdResponse {
        private BigDecimal threshold;
        private String currency;
        private long countAboveThreshold;
        private double percentageAboveThreshold;
        private long totalInCurrency;
    }
}
