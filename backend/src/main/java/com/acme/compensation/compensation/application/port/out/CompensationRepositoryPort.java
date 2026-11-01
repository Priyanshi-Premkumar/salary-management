package com.acme.compensation.compensation.application.port.out;

import com.acme.compensation.compensation.domain.Compensation;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface CompensationRepositoryPort {

    Compensation save(Compensation compensation);

    Compensation saveAndFlush(Compensation compensation);

    Optional<Compensation> findActiveCompensation(Long employeeId, LocalDate asOfDate);

    List<Compensation> findActiveForEmployees(Collection<Long> employeeIds, LocalDate asOfDate);

    List<Compensation> findByEmployeeIdOrderByEffectiveFromAsc(Long employeeId);

    List<Compensation> findByEmployeeIdOrderByEffectiveFromDesc(Long employeeId);

    List<Compensation> findAllActive(LocalDate asOfDate);
}
