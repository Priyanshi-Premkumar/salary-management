package com.acme.compensation.audit.infrastructure.persistence;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import lombok.*;

@Entity
@Table(name = "salary_audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalaryAuditLogEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @Column(name = "changed_by")
    private Long changedBy;

    @Column(name = "changed_by_email", nullable = false, length = 150)
    private String changedByEmail;

    @Column(name = "previous_base_salary", nullable = false, precision = 19, scale = 4)
    private BigDecimal previousBaseSalary;

    @Column(name = "new_base_salary", nullable = false, precision = 19, scale = 4)
    private BigDecimal newBaseSalary;

    @Column(name = "previous_bonus", nullable = false, precision = 19, scale = 4)
    private BigDecimal previousBonus;

    @Column(name = "new_bonus", nullable = false, precision = 19, scale = 4)
    private BigDecimal newBonus;

    @Column(nullable = false, length = 3)
    private String currency;

    @Column(name = "change_reason", nullable = false, columnDefinition = "TEXT")
    private String changeReason;

    @Column(name = "effective_date", nullable = false)
    private LocalDate effectiveDate;

    @Column(name = "changed_at", updatable = false)
    private Instant changedAt;

    @PrePersist
    protected void onCreate() {
        if (changedAt == null) {
            changedAt = Instant.now();
        }
    }
}
