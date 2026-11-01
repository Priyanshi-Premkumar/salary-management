package com.acme.compensation.analytics;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import com.acme.compensation.analytics.application.dto.AnalyticsResponses.*;
import com.acme.compensation.analytics.application.port.out.AnalyticsRepositoryPort;
import com.acme.compensation.analytics.application.service.AnalyticsService;
import com.acme.compensation.analytics.domain.AnalyticsDomain;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AnalyticsServiceTest {

    @Mock
    private AnalyticsRepositoryPort analyticsRepositoryPort;

    private AnalyticsService analyticsService;

    @BeforeEach
    void setUp() {
        analyticsService = new AnalyticsService(analyticsRepositoryPort);
    }

    @Test
    @DisplayName("getOverview calculates aggregate metrics correctly")
    void testGetOverview() {
        LocalDate asOf = LocalDate.of(2026, 1, 1);
        when(analyticsRepositoryPort.countTotalEmployees()).thenReturn(10000L);
        when(analyticsRepositoryPort.countActiveEmployees()).thenReturn(9500L);
        when(analyticsRepositoryPort.countInactiveEmployees()).thenReturn(500L);
        when(analyticsRepositoryPort.countDistinctEmployeesRevisedInYear(2026)).thenReturn(450L);

        when(analyticsRepositoryPort.getCountrySalaryStats(asOf)).thenReturn(List.of(
                new AnalyticsDomain.CountrySalaryStats("USA", "USD", 2500L, new BigDecimal("120000"), new BigDecimal("115000"), new BigDecimal("300000000")),
                new AnalyticsDomain.CountrySalaryStats("India", "INR", 3500L, new BigDecimal("1800000"), new BigDecimal("1700000"), new BigDecimal("6300000000"))
        ));

        OverviewResponse overview = analyticsService.getOverview(asOf);

        assertThat(overview.getTotalEmployees()).isEqualTo(10000L);
        assertThat(overview.getActiveEmployees()).isEqualTo(9500L);
        assertThat(overview.getInactiveEmployees()).isEqualTo(500L);
        assertThat(overview.getTotalRevisionsThisYear()).isEqualTo(450L);
        assertThat(overview.getCurrencySummaries()).hasSize(2);
        assertThat(overview.getCurrencySummaries().get("USD").getEmployeeCount()).isEqualTo(2500L);
    }

    @Test
    @DisplayName("getDepartmentSalaryStats returns department statistics")
    void testGetDepartmentSalaryStats() {
        LocalDate asOf = LocalDate.of(2026, 1, 1);
        when(analyticsRepositoryPort.getDepartmentSalaryStats(eq("USD"), any())).thenReturn(List.of(
                new AnalyticsDomain.DepartmentSalaryStats(
                        "Engineering", "USD", 120L,
                        new BigDecimal("145000.00"), new BigDecimal("140000.00"),
                        new BigDecimal("90000.00"), new BigDecimal("210000.00"),
                        new BigDecimal("15000.00"), new BigDecimal("160000.00")
                )
        ));

        List<DepartmentStatsResponse> stats = analyticsService.getDepartmentSalaryStats("USD", asOf);

        assertThat(stats).hasSize(1);
        DepartmentStatsResponse eng = stats.get(0);
        assertThat(eng.getDepartment()).isEqualTo("Engineering");
        assertThat(eng.getMedianBaseSalary()).isEqualByComparingTo("140000.00");
    }

    @Test
    @DisplayName("getThresholdStats calculates percentage correctly")
    void testGetThresholdStats() {
        LocalDate asOf = LocalDate.of(2026, 1, 1);
        BigDecimal threshold = new BigDecimal("100000");
        when(analyticsRepositoryPort.countEmployeesAboveThreshold(threshold, "USD", asOf)).thenReturn(25L);
        when(analyticsRepositoryPort.getSalariesForCurrency("USD", asOf)).thenReturn(
                List.of(
                        new BigDecimal("50000"),
                        new BigDecimal("60000"),
                        new BigDecimal("100000"),
                        new BigDecimal("150000")
                )
        );

        ThresholdResponse response = analyticsService.getThresholdStats(threshold, "USD", asOf);

        assertThat(response.getCountAboveThreshold()).isEqualTo(25L);
        assertThat(response.getTotalInCurrency()).isEqualTo(4L);
        assertThat(response.getPercentageAboveThreshold()).isEqualTo(625.0); // 25 / 4 * 100 = 625.0
    }

    @Test
    @DisplayName("getSalaryBands places values into correct buckets for USD")
    void testGetSalaryBandsUsd() {
        LocalDate asOf = LocalDate.of(2026, 1, 1);
        when(analyticsRepositoryPort.getSalariesForCurrency("USD", asOf)).thenReturn(List.of(
                new BigDecimal("45000"),  // < 60k
                new BigDecimal("55000"),  // < 60k
                new BigDecimal("75000"),  // 60k-90k
                new BigDecimal("110000"), // 90k-120k
                new BigDecimal("130000"), // 120k-160k
                new BigDecimal("180000"), // 160k-200k
                new BigDecimal("250000")  // > 200k
        ));

        SalaryBandResponse response = analyticsService.getSalaryBands("USD", asOf);

        assertThat(response.getCurrency()).isEqualTo("USD");
        assertThat(response.getBuckets()).hasSize(6);
        assertThat(response.getBuckets().get(0).getCount()).isEqualTo(2); // < 60k
        assertThat(response.getBuckets().get(1).getCount()).isEqualTo(1); // 60k - 90k
        assertThat(response.getBuckets().get(2).getCount()).isEqualTo(1); // 90k - 120k
        assertThat(response.getBuckets().get(3).getCount()).isEqualTo(1); // 120k - 160k
        assertThat(response.getBuckets().get(4).getCount()).isEqualTo(1); // 160k - 200k
        assertThat(response.getBuckets().get(5).getCount()).isEqualTo(1); // > 200k
    }
}
