package com.acme.compensation.audit.infrastructure.persistence;

import com.acme.compensation.audit.application.port.out.AuditRepositoryPort;
import com.acme.compensation.audit.domain.SalaryAuditLog;
import java.time.Instant;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AuditPersistenceAdapter implements AuditRepositoryPort {

    private final JpaAuditLogRepository repository;

    @Override
    public SalaryAuditLog save(SalaryAuditLog auditLog) {
        SalaryAuditLogEntity entity = toEntity(auditLog);
        SalaryAuditLogEntity saved = repository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Page<SalaryAuditLog> searchAuditLogs(Long employeeId, Instant startDate, Instant endDate, Pageable pageable) {
        return repository.searchAuditLogs(employeeId, startDate, endDate, pageable)
                .map(this::toDomain);
    }

    @Override
    public List<SalaryAuditLog> findAllFiltered(Long employeeId, Instant startDate, Instant endDate) {
        return repository.findAllFiltered(employeeId, startDate, endDate).stream()
                .map(this::toDomain)
                .toList();
    }

    private SalaryAuditLogEntity toEntity(SalaryAuditLog domain) {
        return SalaryAuditLogEntity.builder()
                .id(domain.getId())
                .employeeId(domain.getEmployeeId())
                .changedBy(domain.getChangedBy())
                .changedByEmail(domain.getChangedByEmail())
                .previousBaseSalary(domain.getPreviousBaseSalary())
                .newBaseSalary(domain.getNewBaseSalary())
                .previousBonus(domain.getPreviousBonus())
                .newBonus(domain.getNewBonus())
                .currency(domain.getCurrency())
                .changeReason(domain.getChangeReason())
                .effectiveDate(domain.getEffectiveDate())
                .changedAt(domain.getChangedAt())
                .build();
    }

    private SalaryAuditLog toDomain(SalaryAuditLogEntity entity) {
        return SalaryAuditLog.builder()
                .id(entity.getId())
                .employeeId(entity.getEmployeeId())
                .changedBy(entity.getChangedBy())
                .changedByEmail(entity.getChangedByEmail())
                .previousBaseSalary(entity.getPreviousBaseSalary())
                .newBaseSalary(entity.getNewBaseSalary())
                .previousBonus(entity.getPreviousBonus())
                .newBonus(entity.getNewBonus())
                .currency(entity.getCurrency())
                .changeReason(entity.getChangeReason())
                .effectiveDate(entity.getEffectiveDate())
                .changedAt(entity.getChangedAt())
                .build();
    }
}
