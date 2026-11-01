package com.acme.compensation.analytics.application.port.out;

import com.acme.compensation.analytics.domain.AnalyticsDomain;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface AnalyticsRepositoryPort {

    List<AnalyticsDomain.DepartmentSalaryStats> getDepartmentSalaryStats(String currency, LocalDate asOfDate);

    List<AnalyticsDomain.CountrySalaryStats> getCountrySalaryStats(LocalDate asOfDate);

    Long countEmployeesAboveThreshold(BigDecimal threshold, String currency, LocalDate asOfDate);

    List<BigDecimal> getSalariesForCurrency(String currency, LocalDate asOfDate);

    Long countDistinctEmployeesRevisedInYear(int year);

    long countTotalEmployees();

    long countActiveEmployees();

    long countInactiveEmployees();
}
