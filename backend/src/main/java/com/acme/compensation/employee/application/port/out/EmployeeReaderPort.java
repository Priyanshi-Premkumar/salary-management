package com.acme.compensation.employee.application.port.out;

import java.time.LocalDate;
import java.util.Optional;

public interface EmployeeReaderPort {

    record EmployeeSummary(
            Long id,
            String employeeCode,
            String fullName,
            String email,
            String country,
            String department,
            String designation,
            String employmentStatus,
            LocalDate joiningDate
    ) {}

    Optional<EmployeeSummary> findSummaryById(Long id);

    boolean existsById(Long id);

    boolean isEmployeeActive(Long id);
}
