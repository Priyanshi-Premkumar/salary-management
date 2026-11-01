package com.acme.compensation.analytics.infrastructure.persistence;

import com.acme.compensation.analytics.application.port.out.AnalyticsRepositoryPort;
import com.acme.compensation.analytics.domain.AnalyticsDomain;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AnalyticsPersistenceAdapter implements AnalyticsRepositoryPort {

    private final JpaAnalyticsRepository jpaAnalyticsRepository;

    @Override
    public List<AnalyticsDomain.DepartmentSalaryStats> getDepartmentSalaryStats(String currency, LocalDate asOfDate) {
        return jpaAnalyticsRepository.getDepartmentSalaryStats(currency, asOfDate).stream()
                .map(p -> new AnalyticsDomain.DepartmentSalaryStats(
                        p.getDepartment(),
                        p.getCurrency(),
                        p.getEmployeeCount(),
                        p.getAvgBaseSalary(),
                        p.getMedianBaseSalary(),
                        p.getMinBaseSalary(),
                        p.getMaxBaseSalary(),
                        p.getAvgBonus(),
                        p.getAvgTotalCompensation()
                ))
                .toList();
    }

    @Override
    public List<AnalyticsDomain.CountrySalaryStats> getCountrySalaryStats(LocalDate asOfDate) {
        return jpaAnalyticsRepository.getCountrySalaryStats(asOfDate).stream()
                .map(p -> new AnalyticsDomain.CountrySalaryStats(
                        p.getCountry(),
                        p.getCurrency(),
                        p.getEmployeeCount(),
                        p.getAvgBaseSalary(),
                        p.getMedianBaseSalary(),
                        p.getTotalPayroll()
                ))
                .toList();
    }

    @Override
    public Long countEmployeesAboveThreshold(BigDecimal threshold, String currency, LocalDate asOfDate) {
        return jpaAnalyticsRepository.countEmployeesAboveThreshold(threshold, currency, asOfDate);
    }

    @Override
    public List<BigDecimal> getSalariesForCurrency(String currency, LocalDate asOfDate) {
        return jpaAnalyticsRepository.getSalariesForCurrency(currency, asOfDate);
    }

    @Override
    public Long countDistinctEmployeesRevisedInYear(int year) {
        return jpaAnalyticsRepository.countDistinctEmployeesRevisedInYear(year);
    }

    @Override
    public long countTotalEmployees() {
        return jpaAnalyticsRepository.count();
    }

    @Override
    public long countActiveEmployees() {
        return jpaAnalyticsRepository.countActiveEmployees();
    }

    @Override
    public long countInactiveEmployees() {
        return jpaAnalyticsRepository.countInactiveEmployees();
    }
}
