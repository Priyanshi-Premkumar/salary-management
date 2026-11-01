package com.acme.compensation.employee.application.port.out;

import com.acme.compensation.employee.domain.Employee;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface EmployeeRepositoryPort {

    Employee save(Employee employee);

    Optional<Employee> findById(Long id);

    Optional<Employee> findByIdForUpdate(Long id);

    Optional<Employee> findByEmployeeCode(String employeeCode);

    Optional<Employee> findByEmail(String email);

    boolean existsByEmployeeCode(String employeeCode);

    boolean existsByEmail(String email);

    Page<Employee> search(String search, String country, String department, String designation, String status, Pageable pageable);

    java.util.List<Employee> findAllFiltered(String search, String country, String department, String designation, String status);

    long count();
}
