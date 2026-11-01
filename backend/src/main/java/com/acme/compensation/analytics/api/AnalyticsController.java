package com.acme.compensation.analytics.api;

import com.acme.compensation.analytics.application.dto.AnalyticsResponses.*;
import com.acme.compensation.analytics.application.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics", description = "Multi-currency salary analytics, distributions, and projections")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/overview")
    @Operation(summary = "Get high-level organizational headcount, revisions, and currency breakdown")
    public ResponseEntity<OverviewResponse> getOverview(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate asOfDate) {
        return ResponseEntity.ok(analyticsService.getOverview(asOfDate));
    }

    @GetMapping("/departments")
    @Operation(summary = "Get department-level statistics (mean, PostgreSQL median, min, max) isolated by currency")
    public ResponseEntity<List<DepartmentStatsResponse>> getDepartmentStats(
            @RequestParam(required = false) String currency,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate asOfDate) {
        return ResponseEntity.ok(analyticsService.getDepartmentSalaryStats(currency, asOfDate));
    }

    @GetMapping("/countries")
    @Operation(summary = "Get country-level compensation distributions and total payrolls")
    public ResponseEntity<List<CountryStatsResponse>> getCountryStats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate asOfDate) {
        return ResponseEntity.ok(analyticsService.getCountrySalaryStats(asOfDate));
    }

    @GetMapping("/salary-bands")
    @Operation(summary = "Get salary band histogram buckets for a specific currency")
    public ResponseEntity<SalaryBandResponse> getSalaryBands(
            @RequestParam(defaultValue = "USD") String currency,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate asOfDate) {
        return ResponseEntity.ok(analyticsService.getSalaryBands(currency, asOfDate));
    }

    @GetMapping("/threshold")
    @Operation(summary = "Calculate number and percentage of employees earning above a specified threshold")
    public ResponseEntity<ThresholdResponse> getThresholdStats(
            @RequestParam BigDecimal threshold,
            @RequestParam(defaultValue = "USD") String currency,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate asOfDate) {
        return ResponseEntity.ok(analyticsService.getThresholdStats(threshold, currency, asOfDate));
    }
}
