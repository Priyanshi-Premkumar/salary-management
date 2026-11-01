package com.acme.compensation.seed;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

import com.acme.compensation.seed.application.port.out.SeedRepositoryPort;
import com.acme.compensation.seed.application.service.SeedDataService;
import com.acme.compensation.seed.application.service.SeedDataService.SeedResult;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class SeedDataServiceTest {

    @Mock
    private SeedRepositoryPort seedRepositoryPort;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Captor
    private ArgumentCaptor<List<SeedRepositoryPort.SeedEmployeeRecord>> employeesCaptor;

    @Captor
    private ArgumentCaptor<List<SeedRepositoryPort.SeedCompensationRecord>> compensationCaptor;

    @Captor
    private ArgumentCaptor<List<SeedRepositoryPort.SeedAuditLogRecord>> auditLogCaptor;

    private SeedDataService seedDataService;

    @BeforeEach
    void setUp() {
        seedDataService = new SeedDataService(seedRepositoryPort, passwordEncoder);
        lenient().when(passwordEncoder.encode(any())).thenReturn("hashed_password");
        lenient().when(seedRepositoryPort.findUserIdByEmail(any())).thenReturn(2L);
    }

    @Test
    @DisplayName("Should skip seeding if employee count is already >= 10,000 and force is false")
    void testSkipWhenAlreadySeeded() {
        when(seedRepositoryPort.getEmployeeCount()).thenReturn(10000L);

        SeedResult result = seedDataService.seedDatabase(false);

        assertThat(result.executed()).isFalse();
        assertThat(result.employeeCount()).isEqualTo(10000L);
        verify(seedRepositoryPort, never()).batchInsertEmployees(anyList());
        verify(seedRepositoryPort, never()).cleanAllData();
    }

    @Test
    @DisplayName("Should generate exactly 10,000 employees and matching compensation records when count is 0")
    void testSeedWhenEmpty() {
        when(seedRepositoryPort.getEmployeeCount()).thenReturn(0L);

        SeedResult result = seedDataService.seedDatabase(false);

        assertThat(result.executed()).isTrue();
        assertThat(result.employeeCount()).isEqualTo(10000L);
        assertThat(result.compensationCount()).isGreaterThan(10000L);
        assertThat(result.auditLogCount()).isGreaterThan(2000L);

        verify(seedRepositoryPort).batchInsertEmployees(employeesCaptor.capture());
        verify(seedRepositoryPort).batchInsertCompensations(compensationCaptor.capture());
        verify(seedRepositoryPort).batchInsertAuditLogs(auditLogCaptor.capture());
        verify(seedRepositoryPort).updateSequences();

        List<SeedRepositoryPort.SeedEmployeeRecord> employees = employeesCaptor.getValue();
        assertThat(employees).hasSize(10000);

        // Verify country breakdown
        long indiaCount = employees.stream().filter(e -> "India".equals(e.country())).count();
        long usaCount = employees.stream().filter(e -> "USA".equals(e.country())).count();
        long germanyCount = employees.stream().filter(e -> "Germany".equals(e.country())).count();
        long ukCount = employees.stream().filter(e -> "United Kingdom".equals(e.country())).count();
        long uaeCount = employees.stream().filter(e -> "United Arab Emirates".equals(e.country())).count();

        assertThat(indiaCount).isEqualTo(3500L);
        assertThat(usaCount).isEqualTo(2500L);
        assertThat(germanyCount).isEqualTo(1500L);
        assertThat(ukCount).isEqualTo(1500L);
        assertThat(uaeCount).isEqualTo(1000L);
    }

    @Test
    @DisplayName("Should clean all data and reseed if force is true")
    void testForceReseed() {
        when(seedRepositoryPort.getEmployeeCount()).thenReturn(10000L);

        SeedResult result = seedDataService.seedDatabase(true);

        assertThat(result.executed()).isTrue();
        verify(seedRepositoryPort).cleanAllData();
        verify(seedRepositoryPort).batchInsertEmployees(anyList());
    }
}
