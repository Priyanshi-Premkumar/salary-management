package com.acme.compensation.seed.api;

import com.acme.compensation.seed.application.service.SeedDataService;
import com.acme.compensation.seed.application.service.SeedDataService.SeedResult;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Tag(name = "Administration", description = "System initialization, database seeding, and administrative utilities")
public class SeedController {

    private final SeedDataService seedDataService;

    @PostMapping("/seed-data")
    @Operation(summary = "Seed 10,000 deterministic employees, multi-currency compensation, and audit logs")
    public ResponseEntity<SeedResult> seedDatabase(
            @RequestParam(defaultValue = "false") boolean force) {
        return ResponseEntity.ok(seedDataService.seedDatabase(force));
    }
}
