package com.acme.compensation.employee.application.service;

import com.acme.compensation.shared.port.CompensationInitPort;
import com.acme.compensation.shared.port.CompensationLookupPort;
import com.acme.compensation.employee.application.dto.EmployeeRequests;
import com.acme.compensation.employee.application.dto.EmployeeResponses;
import com.acme.compensation.employee.application.port.out.EmployeeRepositoryPort;
import com.acme.compensation.employee.domain.Employee;
import com.acme.compensation.employee.domain.EmploymentStatus;
import com.acme.compensation.shared.exception.BusinessException;
import com.acme.compensation.shared.exception.ResourceNotFoundException;
import com.acme.compensation.shared.exception.ValidationException;
import com.acme.compensation.shared.util.CsvSanitizer;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepositoryPort employeeRepository;
    private final CompensationLookupPort compensationLookup;
    private final CompensationInitPort compensationInit;

    @Transactional
    public EmployeeResponses.EmployeeResponse createEmployee(EmployeeRequests.CreateEmployeeRequest request) {
        String cleanCode = request.getEmployeeCode().trim().toUpperCase();
        String cleanEmail = request.getEmail().trim().toLowerCase();

        if (employeeRepository.existsByEmployeeCode(cleanCode)) {
            throw new ValidationException("Employee with code " + cleanCode + " already exists");
        }
        if (employeeRepository.existsByEmail(cleanEmail)) {
            throw new ValidationException("Employee with email " + cleanEmail + " already exists");
        }

        Employee employee = Employee.builder()
                .employeeCode(cleanCode)
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .email(cleanEmail)
                .phone(request.getPhone() != null ? request.getPhone().trim() : null)
                .country(request.getCountry().trim())
                .department(request.getDepartment().trim())
                .designation(request.getDesignation().trim())
                .employmentStatus(EmploymentStatus.fromString(request.getEmploymentStatus()))
                .joiningDate(request.getJoiningDate())
                .build();

        Employee saved = employeeRepository.save(employee);

        // Initialize compensation atomically in the same transaction
        compensationInit.initializeCompensation(
                saved.getId(),
                request.getInitialBaseSalary(),
                request.getInitialBonus(),
                request.getCurrency().trim().toUpperCase(),
                request.getJoiningDate()
        );

        return mapToResponse(saved, null);
    }

    @Transactional
    public EmployeeResponses.EmployeeResponse updateEmployee(Long id, EmployeeRequests.UpdateEmployeeRequest request) {
        Employee existing = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", id));

        Employee updated = existing.toBuilder()
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .phone(request.getPhone() != null ? request.getPhone().trim() : null)
                .country(request.getCountry().trim())
                .department(request.getDepartment().trim())
                .designation(request.getDesignation().trim())
                .employmentStatus(EmploymentStatus.fromString(request.getEmploymentStatus()))
                .build();

        Employee saved = employeeRepository.save(updated);
        var comp = compensationLookup.findActiveCompensation(saved.getId()).orElse(null);
        return mapToResponse(saved, comp);
    }

    @Transactional(readOnly = true)
    public EmployeeResponses.EmployeeResponse getEmployeeById(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", id));
        var comp = compensationLookup.findActiveCompensation(employee.getId()).orElse(null);
        return mapToResponse(employee, comp);
    }

    @Transactional(readOnly = true)
    public EmployeeResponses.EmployeePageResponse searchEmployees(
            String search, String country, String department, String designation, String status, Pageable pageable) {

        Page<Employee> page = employeeRepository.search(search, country, department, designation, status, pageable);

        List<Long> employeeIds = page.getContent().stream().map(Employee::getId).toList();
        Map<Long, CompensationLookupPort.ActiveCompensationSummary> compMap =
                compensationLookup.findActiveCompensationForEmployees(employeeIds);

        List<EmployeeResponses.EmployeeResponse> responses = page.getContent().stream()
                .map(emp -> mapToResponse(emp, compMap.get(emp.getId())))
                .toList();

        return EmployeeResponses.EmployeePageResponse.builder()
                .content(responses)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public void exportEmployeesCsv(
            String search, String country, String department, String designation, String status, OutputStream outputStream) {
        try (PrintWriter writer = new PrintWriter(new OutputStreamWriter(outputStream, StandardCharsets.UTF_8));
             CSVPrinter csvPrinter = new CSVPrinter(writer, CSVFormat.DEFAULT.builder()
                     .setHeader("Employee Code", "First Name", "Last Name", "Email", "Phone",
                             "Country", "Department", "Designation", "Status", "Joining Date",
                             "Base Salary", "Bonus", "Currency")
                     .build())) {

            List<Employee> employees = employeeRepository.findAllFiltered(search, country, department, designation, status);
            List<Long> ids = employees.stream().map(Employee::getId).toList();
            Map<Long, CompensationLookupPort.ActiveCompensationSummary> compMap =
                    compensationLookup.findActiveCompensationForEmployees(ids);

            for (Employee e : employees) {
                var comp = compMap.get(e.getId());
                csvPrinter.printRecord(
                        CsvSanitizer.sanitize(e.getEmployeeCode()),
                        CsvSanitizer.sanitize(e.getFirstName()),
                        CsvSanitizer.sanitize(e.getLastName()),
                        CsvSanitizer.sanitize(e.getEmail()),
                        CsvSanitizer.sanitize(e.getPhone()),
                        CsvSanitizer.sanitize(e.getCountry()),
                        CsvSanitizer.sanitize(e.getDepartment()),
                        CsvSanitizer.sanitize(e.getDesignation()),
                        CsvSanitizer.sanitize(e.getEmploymentStatus().name()),
                        e.getJoiningDate(),
                        comp != null ? comp.baseSalary() : "",
                        comp != null ? comp.bonus() : "",
                        comp != null ? comp.currency() : ""
                );
            }
            csvPrinter.flush();
        } catch (Exception ex) {
            log.error("Error generating employees CSV export", ex);
            throw new BusinessException("Failed to export employees CSV: " + ex.getMessage());
        }
    }

    private EmployeeResponses.EmployeeResponse mapToResponse(
            Employee employee, CompensationLookupPort.ActiveCompensationSummary comp) {

        EmployeeResponses.CurrentCompensationSummary compSummary = comp != null
                ? EmployeeResponses.CurrentCompensationSummary.builder()
                        .baseSalary(comp.baseSalary())
                        .bonus(comp.bonus())
                        .currency(comp.currency())
                        .effectiveFrom(comp.effectiveFrom())
                        .effectiveTo(null)
                        .totalCompensation((comp.baseSalary() != null ? comp.baseSalary() : BigDecimal.ZERO)
                                .add(comp.bonus() != null ? comp.bonus() : BigDecimal.ZERO))
                        .build()
                : null;

        return EmployeeResponses.EmployeeResponse.builder()
                .id(employee.getId())
                .employeeCode(employee.getEmployeeCode())
                .firstName(employee.getFirstName())
                .lastName(employee.getLastName())
                .fullName(employee.getFullName())
                .email(employee.getEmail())
                .phone(employee.getPhone())
                .country(employee.getCountry())
                .department(employee.getDepartment())
                .designation(employee.getDesignation())
                .employmentStatus(employee.getEmploymentStatus().name())
                .joiningDate(employee.getJoiningDate())
                .currentBaseSalary(comp != null ? comp.baseSalary() : null)
                .currentBonus(comp != null ? comp.bonus() : null)
                .currency(comp != null ? comp.currency() : null)
                .compensationEffectiveFrom(comp != null ? comp.effectiveFrom() : null)
                .currentCompensation(compSummary)
                .build();
    }
}
