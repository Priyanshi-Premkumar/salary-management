package com.acme.compensation.seed.infrastructure;

import com.acme.compensation.seed.application.port.out.SeedRepositoryPort;
import com.acme.compensation.seed.application.service.SeedDataService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@Order(10)
@RequiredArgsConstructor
public class SeedRunner implements CommandLineRunner {

    private final SeedDataService seedDataService;
    private final SeedRepositoryPort seedRepositoryPort;

    @Value("${app.seed.auto:true}")
    private boolean autoSeed;

    @Override
    public void run(String... args) {
        if (autoSeed) {
            long count = seedRepositoryPort.getEmployeeCount();
            if (count == 0) {
                log.info("Detected empty database on startup. Initiating automatic 10,000 employee seed...");
                seedDataService.seedDatabase(false);
            } else {
                log.info("Database already contains {} employees. Skipping auto-seed.", count);
            }
        }
    }
}
