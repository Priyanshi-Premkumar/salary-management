package com.acme.compensation.audit.application.port.out;

import com.acme.compensation.audit.domain.SalaryAuditLog;
import java.time.Instant;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AuditRepositoryPort {

    SalaryAuditLog save(SalaryAuditLog auditLog);

    Page<SalaryAuditLog> searchAuditLogs(Long employeeId, Instant startDate, Instant endDate, Pageable pageable);

    List<SalaryAuditLog> findAllFiltered(Long employeeId, Instant startDate, Instant endDate);
}
