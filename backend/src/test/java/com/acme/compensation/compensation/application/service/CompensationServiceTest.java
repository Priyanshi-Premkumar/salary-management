package com.acme.compensation.compensation.application.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import com.acme.compensation.audit.application.port.in.SalaryAuditWriterPort;
import com.acme.compensation.compensation.application.dto.CompensationDto;
import com.acme.compensation.compensation.application.port.out.CompensationRepositoryPort;
import com.acme.compensation.compensation.domain.Compensation;
import com.acme.compensation.employee.application.port.out.EmployeeReaderPort;
import com.acme.compensation.employee.application.port.out.EmployeeRepositoryPort;
import com.acme.compensation.employee.domain.Employee;
import com.acme.compensation.employee.domain.EmploymentStatus;
import com.acme.compensation.shared.domain.CurrencyCode;
import com.acme.compensation.shared.exception.ValidationException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CompensationServiceTest {

    @Mock
    private CompensationRepositoryPort compensationRepository;

    @Mock
    private EmployeeRepositoryPort employeeRepository;

    @Mock
    private EmployeeReaderPort employeeReader;

    @Mock
    private SalaryAuditWriterPort auditWriter;

    @InjectMocks
    private CompensationService compensationService;

    private Employee activeEmployee;
    private Compensation existingCompensation;

    @BeforeEach
    void setUp() {
        activeEmployee = Employee.builder()
                .id(1L)
                .employeeCode("EMP-001")
                .firstName("Alice")
                .lastName("Smith")
                .email("alice@acme.com")
                .employmentStatus(EmploymentStatus.ACTIVE)
                .joiningDate(LocalDate.of(2023, 1, 1))
                .build();

        existingCompensation = Compensation.builder()
                .id(10L)
                .employeeId(1L)
                .baseSalary(new BigDecimal("100000.0000"))
                .bonus(new BigDecimal("10000.0000"))
                .currency(CurrencyCode.USD)
                .effectiveFrom(LocalDate.of(2023, 1, 1))
                .effectiveTo(null)
                .build();
    }

    @Test
    @DisplayName("Should successfully revise salary, close old record, and write audit log")
    void shouldReviseSalarySuccessfully() {
        when(employeeRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(activeEmployee));

        List<Compensation> history = new ArrayList<>(List.of(existingCompensation));
        when(compensationRepository.findByEmployeeIdOrderByEffectiveFromAsc(1L)).thenReturn(history);

        when(compensationRepository.save(any(Compensation.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CompensationDto.ReviseCompensationRequest request = CompensationDto.ReviseCompensationRequest.builder()
                .newBaseSalary(new BigDecimal("115000.0000"))
                .newBonus(new BigDecimal("12000.0000"))
                .currency("USD")
                .effectiveFrom(LocalDate.of(2024, 1, 1))
                .reason("Annual Merit Increase")
                .build();

        CompensationDto.CompensationResponse response = compensationService.reviseCompensation(
                1L, request, 99L, "hr@acme.com");

        assertNotNull(response);
        assertEquals(new BigDecimal("115000.0000"), response.getBaseSalary());
        assertEquals(new BigDecimal("12000.0000"), response.getBonus());
        assertEquals("USD", response.getCurrency());
        assertEquals(LocalDate.of(2024, 1, 1), response.getEffectiveFrom());

        // Verify audit log recorded atomically
        verify(auditWriter, times(1)).recordAudit(
                eq(1L),
                eq(99L),
                eq("hr@acme.com"),
                eq(new BigDecimal("100000.0000")),
                eq(new BigDecimal("115000.0000")),
                eq(new BigDecimal("10000.0000")),
                eq(new BigDecimal("12000.0000")),
                eq("USD"),
                eq("Annual Merit Increase"),
                eq(LocalDate.of(2024, 1, 1))
        );
    }

    @Test
    @DisplayName("Should reject revision date prior to employee joining date")
    void shouldRejectRevisionDatePriorToJoiningDate() {
        when(employeeRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(activeEmployee));

        CompensationDto.ReviseCompensationRequest request = CompensationDto.ReviseCompensationRequest.builder()
                .newBaseSalary(new BigDecimal("115000.0000"))
                .newBonus(new BigDecimal("10000.0000"))
                .currency("USD")
                .effectiveFrom(LocalDate.of(2022, 6, 1))
                .reason("Backdated attempt")
                .build();

        ValidationException ex = assertThrows(ValidationException.class,
                () -> compensationService.reviseCompensation(1L, request, 99L, "hr@acme.com"));

        assertTrue(ex.getMessage().contains("cannot be earlier than employee joining date"));
        verifyNoInteractions(auditWriter);
    }
}
