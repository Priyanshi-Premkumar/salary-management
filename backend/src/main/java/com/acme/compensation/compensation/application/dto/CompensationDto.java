package com.acme.compensation.compensation.application.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import lombok.*;

public class CompensationDto {

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReviseCompensationRequest {
        @NotNull(message = "New base salary is required")
        @DecimalMin(value = "0.01", message = "Base salary must be greater than zero")
        private BigDecimal newBaseSalary;

        @NotNull(message = "New bonus is required")
        @DecimalMin(value = "0.00", message = "Bonus cannot be negative")
        private BigDecimal newBonus;

        @NotBlank(message = "Currency is required")
        private String currency;

        @NotNull(message = "Effective date is required")
        private LocalDate effectiveFrom;

        @NotBlank(message = "Revision reason is required")
        @Size(min = 3, max = 500, message = "Reason must be between 3 and 500 characters")
        private String reason;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CompensationResponse {
        private Long id;
        private Long employeeId;
        private BigDecimal baseSalary;
        private BigDecimal bonus;
        private BigDecimal totalCompensation;
        private String currency;
        private LocalDate effectiveFrom;
        private LocalDate effectiveTo;
        private boolean active;
        private boolean future;
        private boolean historical;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CompensationHistoryItem {
        private Long id;
        private Long employeeId;
        private BigDecimal baseSalary;
        private BigDecimal bonus;
        private BigDecimal totalCompensation;
        private String currency;
        private LocalDate effectiveFrom;
        private LocalDate effectiveTo;
        private String status; // HISTORICAL, CURRENT, FUTURE
        private BigDecimal deltaFromPrevious;
        private Double percentageChange;
    }
}
