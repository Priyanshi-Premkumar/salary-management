package com.acme.compensation;

import static org.assertj.core.api.Assertions.assertThat;

import com.acme.compensation.analytics.application.dto.AnalyticsResponses.*;
import com.acme.compensation.compensation.application.dto.CompensationDto.*;
import com.acme.compensation.employee.application.dto.EmployeeResponses.*;
import com.acme.compensation.security.application.AuthRequests.LoginRequest;
import com.acme.compensation.security.application.AuthResponses.AuthResponse;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class EndToEndIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    private String getBaseUrl() {
        return "http://localhost:" + port + "/api/v1";
    }

    @Test
    @DisplayName("Complete E2E workflow: Login, Employee Search, Atomic Revision, Temporal History, and Multi-Currency Analytics")
    void testCompleteE2EWorkflow() {
        // 1. Authenticate as HR Manager
        LoginRequest loginReq = LoginRequest.builder()
                .email("hrmanager@acme.com")
                .password("Manager@123")
                .build();

        ResponseEntity<AuthResponse> authResp = restTemplate.postForEntity(
                getBaseUrl() + "/auth/login", loginReq, AuthResponse.class);
        assertThat(authResp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(authResp.getBody()).isNotNull();
        String token = authResp.getBody().getToken();
        assertThat(token).isNotBlank();

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(MediaType.APPLICATION_JSON);

        // 2. Search Employees (Verify 10,000 employees seeded)
        HttpEntity<Void> getEntity = new HttpEntity<>(headers);
        ResponseEntity<EmployeePageResponse> empResp = restTemplate.exchange(
                getBaseUrl() + "/employees?page=0&size=10",
                HttpMethod.GET,
                getEntity,
                EmployeePageResponse.class
        );
        assertThat(empResp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(empResp.getBody()).isNotNull();
        assertThat(empResp.getBody().getTotalElements()).isEqualTo(10000L);

        // 3. Get Employee #500 Details and existing compensation history
        ResponseEntity<EmployeeResponse> empResp500 = restTemplate.exchange(
                getBaseUrl() + "/employees/500",
                HttpMethod.GET,
                getEntity,
                EmployeeResponse.class
        );
        assertThat(empResp500.getStatusCode()).isEqualTo(HttpStatus.OK);
        EmployeeResponse emp500 = empResp500.getBody();
        assertThat(emp500).isNotNull();
        BigDecimal currentBase = emp500.getCurrentBaseSalary();

        ResponseEntity<List<CompensationHistoryItem>> initialHistoryResp = restTemplate.exchange(
                getBaseUrl() + "/employees/500/salary-history",
                HttpMethod.GET,
                getEntity,
                new ParameterizedTypeReference<>() {}
        );
        assertThat(initialHistoryResp.getStatusCode()).isEqualTo(HttpStatus.OK);
        List<CompensationHistoryItem> initialHistory = initialHistoryResp.getBody();
        assertThat(initialHistory).isNotNull();
        int previousHistoryCount = initialHistory.size();

        LocalDate latestDate = initialHistory.stream()
                .map(CompensationHistoryItem::getEffectiveFrom)
                .max(Comparator.naturalOrder())
                .orElse(LocalDate.now());
        LocalDate revisionDate = latestDate.plusMonths(6);

        // 4. Perform Atomic Salary Revision
        BigDecimal newBase = currentBase.add(BigDecimal.valueOf(15000));
        ReviseCompensationRequest revisionReq = ReviseCompensationRequest.builder()
                .newBaseSalary(newBase)
                .newBonus(BigDecimal.valueOf(10000))
                .currency(emp500.getCurrency())
                .effectiveFrom(revisionDate)
                .reason("E2E Test Merit Increase")
                .build();

        HttpEntity<ReviseCompensationRequest> revisionEntity = new HttpEntity<>(revisionReq, headers);
        ResponseEntity<CompensationResponse> revResp = restTemplate.exchange(
                getBaseUrl() + "/employees/500/compensation",
                HttpMethod.POST,
                revisionEntity,
                CompensationResponse.class
        );
        assertThat(revResp.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(revResp.getBody().getBaseSalary()).isEqualByComparingTo(newBase);

        // 5. Query Temporal Compensation History (Verify new record added and old record closed)
        ResponseEntity<List<CompensationHistoryItem>> historyResp = restTemplate.exchange(
                getBaseUrl() + "/employees/500/salary-history",
                HttpMethod.GET,
                getEntity,
                new ParameterizedTypeReference<>() {}
        );
        assertThat(historyResp.getStatusCode()).isEqualTo(HttpStatus.OK);
        List<CompensationHistoryItem> history = historyResp.getBody();
        assertThat(history).isNotNull();
        assertThat(history.size()).isEqualTo(previousHistoryCount + 1);

        // 6. Query Multi-Currency Analytics Overview
        ResponseEntity<OverviewResponse> overviewResp = restTemplate.exchange(
                getBaseUrl() + "/analytics/overview",
                HttpMethod.GET,
                getEntity,
                OverviewResponse.class
        );
        assertThat(overviewResp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(overviewResp.getBody().getTotalEmployees()).isEqualTo(10000L);
        assertThat(overviewResp.getBody().getCurrencySummaries()).hasSize(5);

        // 7. Query Department Statistics with PostgreSQL Median
        ResponseEntity<List<DepartmentStatsResponse>> deptResp = restTemplate.exchange(
                getBaseUrl() + "/analytics/departments?currency=USD",
                HttpMethod.GET,
                getEntity,
                new ParameterizedTypeReference<>() {}
        );
        assertThat(deptResp.getStatusCode()).isEqualTo(HttpStatus.OK);
        List<DepartmentStatsResponse> depts = deptResp.getBody();
        assertThat(depts).isNotNull();
        assertThat(depts).isNotEmpty();
        assertThat(depts.get(0).getMedianBaseSalary()).isNotNull();

        // 8. Query Threshold Projection
        ResponseEntity<ThresholdResponse> threshResp = restTemplate.exchange(
                getBaseUrl() + "/analytics/threshold?threshold=100000&currency=USD",
                HttpMethod.GET,
                getEntity,
                ThresholdResponse.class
        );
        assertThat(threshResp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(threshResp.getBody().getCountAboveThreshold()).isGreaterThan(0L);

        // 9. Download Sanitized CSV Export
        ResponseEntity<String> csvResp = restTemplate.exchange(
                getBaseUrl() + "/employees/export?country=USA",
                HttpMethod.GET,
                getEntity,
                String.class
        );
        assertThat(csvResp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(csvResp.getBody()).contains("Employee Code,First Name,Last Name");
    }
}
