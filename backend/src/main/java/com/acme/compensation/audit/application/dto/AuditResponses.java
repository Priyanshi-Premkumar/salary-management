package com.acme.compensation.audit.application.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import lombok.*;

public class AuditResponses {

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AuditLogResponse {
        private Long id;
        private Long employeeId;
        private String employeeCode;
        private String employeeName;
        private Long changedByUserId;
        private String changedByEmail;
        private BigDecimal previousBaseSalary;
        private BigDecimal newBaseSalary;
        private BigDecimal previousBonus;
        private BigDecimal newBonus;
        private BigDecimal salaryDelta;
        private Double percentageChange;
        private String currency;
        private String changeReason;
        private LocalDate effectiveDate;
        private Instant changedAt;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AuditLogPageResponse {
        private List<AuditLogResponse> content;
        private int page;
        private int size;
        private long totalElements;
        private int totalPages;
        private boolean first;
        private boolean last;
    }
}
