package com.acme.compensation.analytics.application.service;

import com.acme.compensation.analytics.application.dto.AnalyticsResponses.*;
import com.acme.compensation.analytics.application.port.out.AnalyticsRepositoryPort;
import com.acme.compensation.analytics.domain.AnalyticsDomain;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsService {

    private final AnalyticsRepositoryPort analyticsRepositoryPort;

    public OverviewResponse getOverview(LocalDate asOfDate) {
        LocalDate effectiveDate = asOfDate != null ? asOfDate : LocalDate.now();

        long totalEmployees = analyticsRepositoryPort.countTotalEmployees();
        long activeEmployees = analyticsRepositoryPort.countActiveEmployees();
        long inactiveEmployees = analyticsRepositoryPort.countInactiveEmployees();
        Long revisions = analyticsRepositoryPort.countDistinctEmployeesRevisedInYear(effectiveDate.getYear());
        long totalRevisionsThisYear = revisions != null ? revisions : 0L;

        List<AnalyticsDomain.CountrySalaryStats> countryStats = analyticsRepositoryPort.getCountrySalaryStats(effectiveDate);

        Map<String, CurrencySummary> currencySummaries = new LinkedHashMap<>();
        for (AnalyticsDomain.CountrySalaryStats cs : countryStats) {
            String currency = cs.currency();
            currencySummaries.compute(currency, (curr, existing) -> {
                if (existing == null) {
                    return CurrencySummary.builder()
                            .currency(curr)
                            .employeeCount(cs.employeeCount())
                            .totalBasePayroll(cs.totalPayroll())
                            .averageBaseSalary(cs.avgBaseSalary())
                            .medianBaseSalary(cs.medianBaseSalary())
                            .build();
                } else {
                    long newCount = existing.getEmployeeCount() + cs.employeeCount();
                    BigDecimal newTotal = existing.getTotalBasePayroll().add(cs.totalPayroll());
                    BigDecimal newAvg = newCount > 0 ? newTotal.divide(BigDecimal.valueOf(newCount), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
                    return CurrencySummary.builder()
                            .currency(curr)
                            .employeeCount(newCount)
                            .totalBasePayroll(newTotal)
                            .averageBaseSalary(newAvg)
                            .medianBaseSalary(existing.getMedianBaseSalary())
                            .build();
                }
            });
        }

        return OverviewResponse.builder()
                .totalEmployees(totalEmployees)
                .activeEmployees(activeEmployees)
                .inactiveEmployees(inactiveEmployees)
                .totalRevisionsThisYear(totalRevisionsThisYear)
                .currencySummaries(currencySummaries)
                .build();
    }

    public List<DepartmentStatsResponse> getDepartmentSalaryStats(String currency, LocalDate asOfDate) {
        LocalDate effectiveDate = asOfDate != null ? asOfDate : LocalDate.now();
        List<AnalyticsDomain.DepartmentSalaryStats> domainStats = analyticsRepositoryPort.getDepartmentSalaryStats(currency, effectiveDate);

        return domainStats.stream()
                .map(s -> DepartmentStatsResponse.builder()
                        .department(s.department())
                        .currency(s.currency())
                        .employeeCount(s.employeeCount())
                        .avgBaseSalary(s.avgBaseSalary())
                        .medianBaseSalary(s.medianBaseSalary())
                        .minBaseSalary(s.minBaseSalary())
                        .maxBaseSalary(s.maxBaseSalary())
                        .avgBonus(s.avgBonus())
                        .avgTotalCompensation(s.avgTotalCompensation())
                        .build())
                .toList();
    }

    public List<CountryStatsResponse> getCountrySalaryStats(LocalDate asOfDate) {
        LocalDate effectiveDate = asOfDate != null ? asOfDate : LocalDate.now();
        List<AnalyticsDomain.CountrySalaryStats> domainStats = analyticsRepositoryPort.getCountrySalaryStats(effectiveDate);

        return domainStats.stream()
                .map(s -> CountryStatsResponse.builder()
                        .country(s.country())
                        .currency(s.currency())
                        .employeeCount(s.employeeCount())
                        .avgBaseSalary(s.avgBaseSalary())
                        .medianBaseSalary(s.medianBaseSalary())
                        .totalPayroll(s.totalPayroll())
                        .build())
                .toList();
    }

    public SalaryBandResponse getSalaryBands(String currency, LocalDate asOfDate) {
        LocalDate effectiveDate = asOfDate != null ? asOfDate : LocalDate.now();
        List<BigDecimal> salaries = analyticsRepositoryPort.getSalariesForCurrency(currency, effectiveDate);

        List<SalaryBandBucket> buckets = buildBandsForCurrency(currency, salaries);

        return SalaryBandResponse.builder()
                .currency(currency)
                .buckets(buckets)
                .build();
    }

    public ThresholdResponse getThresholdStats(BigDecimal threshold, String currency, LocalDate asOfDate) {
        LocalDate effectiveDate = asOfDate != null ? asOfDate : LocalDate.now();
        Long count = analyticsRepositoryPort.countEmployeesAboveThreshold(threshold, currency, effectiveDate);
        long countAbove = count != null ? count : 0L;

        List<BigDecimal> salaries = analyticsRepositoryPort.getSalariesForCurrency(currency, effectiveDate);
        long totalInCurrency = salaries.size();

        double percentage = totalInCurrency > 0
                ? BigDecimal.valueOf((countAbove * 100.0) / totalInCurrency).setScale(2, RoundingMode.HALF_UP).doubleValue()
                : 0.0;

        return ThresholdResponse.builder()
                .threshold(threshold)
                .currency(currency)
                .countAboveThreshold(countAbove)
                .percentageAboveThreshold(percentage)
                .totalInCurrency(totalInCurrency)
                .build();
    }

    private List<SalaryBandBucket> buildBandsForCurrency(String currency, List<BigDecimal> salaries) {
        List<BandDefinition> definitions = getBandDefinitions(currency, salaries);
        List<SalaryBandBucket> buckets = new ArrayList<>();

        for (BandDefinition def : definitions) {
            long count = salaries.stream()
                    .filter(s -> {
                        boolean aboveMin = def.min == null || s.compareTo(def.min) >= 0;
                        boolean belowMax = def.max == null || s.compareTo(def.max) < 0;
                        return aboveMin && belowMax;
                    })
                    .count();

            buckets.add(SalaryBandBucket.builder()
                    .label(def.label)
                    .min(def.min)
                    .max(def.max)
                    .count(count)
                    .build());
        }

        return buckets;
    }

    private record BandDefinition(String label, BigDecimal min, BigDecimal max) {}

    private List<BandDefinition> getBandDefinitions(String currency, List<BigDecimal> salaries) {
        if ("USD".equalsIgnoreCase(currency)) {
            return List.of(
                    new BandDefinition("< $60k", null, new BigDecimal("60000")),
                    new BandDefinition("$60k - $90k", new BigDecimal("60000"), new BigDecimal("90000")),
                    new BandDefinition("$90k - $120k", new BigDecimal("90000"), new BigDecimal("120000")),
                    new BandDefinition("$120k - $160k", new BigDecimal("120000"), new BigDecimal("160000")),
                    new BandDefinition("$160k - $200k", new BigDecimal("160000"), new BigDecimal("200000")),
                    new BandDefinition("> $200k", new BigDecimal("200000"), null)
            );
        } else if ("EUR".equalsIgnoreCase(currency)) {
            return List.of(
                    new BandDefinition("< €50k", null, new BigDecimal("50000")),
                    new BandDefinition("€50k - €75k", new BigDecimal("50000"), new BigDecimal("75000")),
                    new BandDefinition("€75k - €100k", new BigDecimal("75000"), new BigDecimal("100000")),
                    new BandDefinition("€100k - €130k", new BigDecimal("100000"), new BigDecimal("130000")),
                    new BandDefinition("€130k - €160k", new BigDecimal("130000"), new BigDecimal("160000")),
                    new BandDefinition("> €160k", new BigDecimal("160000"), null)
            );
        } else if ("GBP".equalsIgnoreCase(currency)) {
            return List.of(
                    new BandDefinition("< £45k", null, new BigDecimal("45000")),
                    new BandDefinition("£45k - £65k", new BigDecimal("45000"), new BigDecimal("65000")),
                    new BandDefinition("£65k - £90k", new BigDecimal("65000"), new BigDecimal("90000")),
                    new BandDefinition("£90k - £120k", new BigDecimal("90000"), new BigDecimal("120000")),
                    new BandDefinition("£120k - £150k", new BigDecimal("120000"), new BigDecimal("150000")),
                    new BandDefinition("> £150k", new BigDecimal("150000"), null)
            );
        } else if ("INR".equalsIgnoreCase(currency)) {
            return List.of(
                    new BandDefinition("< ₹600k", null, new BigDecimal("600000")),
                    new BandDefinition("₹600k - ₹1.2M", new BigDecimal("600000"), new BigDecimal("1200000")),
                    new BandDefinition("₹1.2M - ₹2M", new BigDecimal("1200000"), new BigDecimal("2000000")),
                    new BandDefinition("₹2M - ₹3.5M", new BigDecimal("2000000"), new BigDecimal("3500000")),
                    new BandDefinition("₹3.5M - ₹5M", new BigDecimal("3500000"), new BigDecimal("5000000")),
                    new BandDefinition("> ₹5M", new BigDecimal("5000000"), null)
            );
        } else if ("AED".equalsIgnoreCase(currency)) {
            return List.of(
                    new BandDefinition("< 100k AED", null, new BigDecimal("100000")),
                    new BandDefinition("100k - 160k AED", new BigDecimal("100000"), new BigDecimal("160000")),
                    new BandDefinition("160k - 220k AED", new BigDecimal("160000"), new BigDecimal("220000")),
                    new BandDefinition("220k - 280k AED", new BigDecimal("220000"), new BigDecimal("280000")),
                    new BandDefinition("280k - 350k AED", new BigDecimal("280000"), new BigDecimal("350000")),
                    new BandDefinition("> 350k AED", new BigDecimal("350000"), null)
            );
        }

        // Generic fallback if empty or unusual currency
        if (salaries.isEmpty()) {
            return List.of(new BandDefinition("All", null, null));
        }

        BigDecimal min = salaries.get(0);
        BigDecimal max = salaries.get(salaries.size() - 1);
        if (min.compareTo(max) == 0) {
            return List.of(new BandDefinition("All (" + min + ")", min, max));
        }

        BigDecimal step = max.subtract(min).divide(BigDecimal.valueOf(5), 2, RoundingMode.HALF_UP);
        List<BandDefinition> fallback = new ArrayList<>();
        BigDecimal current = min;
        for (int i = 0; i < 5; i++) {
            BigDecimal next = (i == 4) ? null : current.add(step);
            String label = (next != null) ? (current + " - " + next) : ("> " + current);
            fallback.add(new BandDefinition(label, current, next));
            current = current.add(step);
        }
        return fallback;
    }
}
