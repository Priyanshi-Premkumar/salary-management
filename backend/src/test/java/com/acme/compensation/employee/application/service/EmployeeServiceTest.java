package com.acme.compensation.employee.application.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.acme.compensation.shared.port.CompensationInitPort;
import com.acme.compensation.shared.port.CompensationLookupPort;
import com.acme.compensation.employee.application.dto.EmployeeRequests;
import com.acme.compensation.employee.application.dto.EmployeeResponses;
import com.acme.compensation.employee.application.port.out.EmployeeRepositoryPort;
import com.acme.compensation.employee.domain.Employee;
import com.acme.compensation.employee.domain.EmploymentStatus;
import com.acme.compensation.shared.exception.ResourceNotFoundException;
import com.acme.compensation.shared.exception.ValidationException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceTest {

    @Mock
    private EmployeeRepositoryPort employeeRepository;

    @Mock
    private CompensationLookupPort compensationLookup;

    @Mock
    private CompensationInitPort compensationInit;

    @InjectMocks
    private EmployeeService employeeService;

    private EmployeeRequests.CreateEmployeeRequest sampleCreateRequest;

    @BeforeEach
    void setUp() {
        sampleCreateRequest = EmployeeRequests.CreateEmployeeRequest.builder()
                .employeeCode("EMP-001")
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@acme.com")
                .phone("+1-555-0100")
                .country("USA")
                .department("Engineering")
                .designation("Senior Engineer")
                .employmentStatus("ACTIVE")
                .joiningDate(LocalDate.of(2023, 1, 15))
                .initialBaseSalary(new BigDecimal("120000"))
                .initialBonus(new BigDecimal("10000"))
                .currency("USD")
                .build();
    }

    @Test
    @DisplayName("Should successfully create employee and initialize compensation")
    void shouldCreateEmployeeSuccessfully() {
        when(employeeRepository.existsByEmployeeCode("EMP-001")).thenReturn(false);
        when(employeeRepository.existsByEmail("john.doe@acme.com")).thenReturn(false);

        Employee saved = Employee.builder()
                .id(1L)
                .employeeCode("EMP-001")
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@acme.com")
                .country("USA")
                .department("Engineering")
                .designation("Senior Engineer")
                .employmentStatus(EmploymentStatus.ACTIVE)
                .joiningDate(LocalDate.of(2023, 1, 15))
                .build();

        when(employeeRepository.save(any(Employee.class))).thenReturn(saved);

        EmployeeResponses.EmployeeResponse response = employeeService.createEmployee(sampleCreateRequest);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("EMP-001", response.getEmployeeCode());
        assertEquals("John Doe", response.getFullName());

        verify(compensationInit, times(1)).initializeCompensation(
                eq(1L),
                eq(new BigDecimal("120000")),
                eq(new BigDecimal("10000")),
                eq("USD"),
                eq(LocalDate.of(2023, 1, 15))
        );
    }

    @Test
    @DisplayName("Should throw ValidationException when employee code already exists")
    void shouldRejectDuplicateEmployeeCode() {
        when(employeeRepository.existsByEmployeeCode("EMP-001")).thenReturn(true);

        ValidationException ex = assertThrows(ValidationException.class,
                () -> employeeService.createEmployee(sampleCreateRequest));
        assertTrue(ex.getMessage().contains("already exists"));
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when employee does not exist")
    void shouldThrowWhenEmployeeNotFound() {
        when(employeeRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> employeeService.getEmployeeById(999L));
    }
}
