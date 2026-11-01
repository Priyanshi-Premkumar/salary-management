package com.acme.compensation.seed;

import static org.assertj.core.api.Assertions.assertThat;

import com.acme.compensation.seed.application.port.out.SeedRepositoryPort;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class SeedDataVerificationTest {

    @Autowired
    private SeedRepositoryPort seedRepositoryPort;

    @Autowired
    private com.acme.compensation.seed.application.service.SeedDataService seedDataService;

    @Test
    @DisplayName("Verify that deterministic 10,000 employees were seeded in PostgreSQL")
    void testSeedDataPopulated() {
        seedDataService.seedDatabase(false);
        long count = seedRepositoryPort.getEmployeeCount();
        assertThat(count).isEqualTo(10000L);
        assertThat(seedRepositoryPort.findUserIdByEmail("admin@acme.com")).isNotNull();
        assertThat(seedRepositoryPort.findUserIdByEmail("hrmanager@acme.com")).isNotNull();
    }
}
