package com.acme.compensation.compensation.infrastructure.persistence;

import com.acme.compensation.compensation.application.port.out.CompensationRepositoryPort;
import com.acme.compensation.compensation.domain.Compensation;
import com.acme.compensation.shared.domain.CurrencyCode;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CompensationPersistenceAdapter implements CompensationRepositoryPort {

    private final JpaCompensationRepository repository;

    @Override
    public Compensation save(Compensation domain) {
        CompensationEntity entity = toEntity(domain);
        CompensationEntity saved = repository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Compensation saveAndFlush(Compensation domain) {
        CompensationEntity entity = toEntity(domain);
        CompensationEntity saved = repository.saveAndFlush(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<Compensation> findActiveCompensation(Long employeeId, LocalDate asOfDate) {
        return repository.findActiveCompensation(employeeId, asOfDate).map(this::toDomain);
    }

    @Override
    public List<Compensation> findActiveForEmployees(Collection<Long> employeeIds, LocalDate asOfDate) {
        return repository.findActiveForEmployees(employeeIds, asOfDate).stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    public List<Compensation> findByEmployeeIdOrderByEffectiveFromAsc(Long employeeId) {
        return repository.findByEmployeeIdOrderByEffectiveFromAsc(employeeId).stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    public List<Compensation> findByEmployeeIdOrderByEffectiveFromDesc(Long employeeId) {
        return repository.findByEmployeeIdOrderByEffectiveFromDesc(employeeId).stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    public List<Compensation> findAllActive(LocalDate asOfDate) {
        return repository.findAllActive(asOfDate).stream()
                .map(this::toDomain)
                .toList();
    }

    private CompensationEntity toEntity(Compensation domain) {
        return CompensationEntity.builder()
                .id(domain.getId())
                .employeeId(domain.getEmployeeId())
                .baseSalary(domain.getBaseSalary())
                .bonus(domain.getBonus())
                .currency(domain.getCurrency().name())
                .effectiveFrom(domain.getEffectiveFrom())
                .effectiveTo(domain.getEffectiveTo())
                .build();
    }

    private Compensation toDomain(CompensationEntity entity) {
        return Compensation.builder()
                .id(entity.getId())
                .employeeId(entity.getEmployeeId())
                .baseSalary(entity.getBaseSalary())
                .bonus(entity.getBonus())
                .currency(CurrencyCode.fromString(entity.getCurrency()))
                .effectiveFrom(entity.getEffectiveFrom())
                .effectiveTo(entity.getEffectiveTo())
                .build();
    }
}
