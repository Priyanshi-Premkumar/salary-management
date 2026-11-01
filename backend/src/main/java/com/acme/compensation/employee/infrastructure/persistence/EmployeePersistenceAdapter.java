package com.acme.compensation.employee.infrastructure.persistence;

import com.acme.compensation.employee.application.port.out.EmployeeReaderPort;
import com.acme.compensation.employee.application.port.out.EmployeeRepositoryPort;
import com.acme.compensation.employee.domain.Employee;
import com.acme.compensation.employee.domain.EmploymentStatus;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class EmployeePersistenceAdapter implements EmployeeRepositoryPort, EmployeeReaderPort {

    private final JpaEmployeeRepository repository;

    @Override
    public Employee save(Employee employee) {
        EmployeeEntity entity = toEntity(employee);
        EmployeeEntity saved = repository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<Employee> findById(Long id) {
        return repository.findById(id).map(this::toDomain);
    }

    @Override
    public Optional<Employee> findByIdForUpdate(Long id) {
        return repository.findByIdForUpdate(id).map(this::toDomain);
    }

    @Override
    public Optional<Employee> findByEmployeeCode(String employeeCode) {
        return repository.findByEmployeeCode(employeeCode).map(this::toDomain);
    }

    @Override
    public Optional<Employee> findByEmail(String email) {
        return repository.findByEmail(email).map(this::toDomain);
    }

    @Override
    public boolean existsByEmployeeCode(String employeeCode) {
        return repository.existsByEmployeeCode(employeeCode);
    }

    @Override
    public boolean existsByEmail(String email) {
        return repository.existsByEmail(email);
    }

    @Override
    public Page<Employee> search(String search, String country, String department, String designation, String status, Pageable pageable) {
        EmploymentStatus statusEnum = (status != null && !status.isBlank()) ? EmploymentStatus.fromString(status) : null;
        org.springframework.data.jpa.domain.Specification<EmployeeEntity> spec = buildSpecification(search, country, department, designation, statusEnum);
        return repository.findAll(spec, pageable).map(this::toDomain);
    }

    @Override
    public List<Employee> findAllFiltered(String search, String country, String department, String designation, String status) {
        EmploymentStatus statusEnum = (status != null && !status.isBlank()) ? EmploymentStatus.fromString(status) : null;
        org.springframework.data.jpa.domain.Specification<EmployeeEntity> spec = buildSpecification(search, country, department, designation, statusEnum);
        return repository.findAll(spec).stream().map(this::toDomain).toList();
    }

    private org.springframework.data.jpa.domain.Specification<EmployeeEntity> buildSpecification(
            String search, String country, String department, String designation, EmploymentStatus status) {
        return (root, query, cb) -> {
            java.util.List<jakarta.persistence.criteria.Predicate> predicates = new java.util.ArrayList<>();
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.toLowerCase().trim() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("firstName")), pattern),
                        cb.like(cb.lower(root.get("lastName")), pattern),
                        cb.like(cb.lower(root.get("employeeCode")), pattern),
                        cb.like(cb.lower(root.get("email")), pattern)
                ));
            }
            if (country != null && !country.isBlank()) {
                predicates.add(cb.equal(root.get("country"), country.trim()));
            }
            if (department != null && !department.isBlank()) {
                predicates.add(cb.equal(root.get("department"), department.trim()));
            }
            if (designation != null && !designation.isBlank()) {
                predicates.add(cb.equal(root.get("designation"), designation.trim()));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("employmentStatus"), status));
            }
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
    }

    @Override
    public long count() {
        return repository.count();
    }

    // Public EmployeeReaderPort methods (for other modules)
    @Override
    public Optional<EmployeeSummary> findSummaryById(Long id) {
        return repository.findById(id).map(e -> new EmployeeSummary(
                e.getId(),
                e.getEmployeeCode(),
                e.getFirstName() + " " + e.getLastName(),
                e.getEmail(),
                e.getCountry(),
                e.getDepartment(),
                e.getDesignation(),
                e.getEmploymentStatus().name(),
                e.getJoiningDate()
        ));
    }

    @Override
    public boolean existsById(Long id) {
        return repository.existsById(id);
    }

    @Override
    public boolean isEmployeeActive(Long id) {
        return repository.findById(id)
                .map(e -> e.getEmploymentStatus() == EmploymentStatus.ACTIVE)
                .orElse(false);
    }

    private EmployeeEntity toEntity(Employee domain) {
        return EmployeeEntity.builder()
                .id(domain.getId())
                .employeeCode(domain.getEmployeeCode())
                .firstName(domain.getFirstName())
                .lastName(domain.getLastName())
                .email(domain.getEmail())
                .phone(domain.getPhone())
                .country(domain.getCountry())
                .department(domain.getDepartment())
                .designation(domain.getDesignation())
                .employmentStatus(domain.getEmploymentStatus())
                .joiningDate(domain.getJoiningDate())
                .build();
    }

    private Employee toDomain(EmployeeEntity entity) {
        return Employee.builder()
                .id(entity.getId())
                .employeeCode(entity.getEmployeeCode())
                .firstName(entity.getFirstName())
                .lastName(entity.getLastName())
                .email(entity.getEmail())
                .phone(entity.getPhone())
                .country(entity.getCountry())
                .department(entity.getDepartment())
                .designation(entity.getDesignation())
                .employmentStatus(entity.getEmploymentStatus())
                .joiningDate(entity.getJoiningDate())
                .build();
    }
}
