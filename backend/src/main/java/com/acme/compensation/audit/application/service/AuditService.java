package com.acme.compensation.audit.application.service;

import com.acme.compensation.audit.application.dto.AuditResponses;
import com.acme.compensation.audit.application.port.in.SalaryAuditWriterPort;
import com.acme.compensation.audit.application.port.out.AuditRepositoryPort;
import com.acme.compensation.audit.domain.SalaryAuditLog;
import com.acme.compensation.employee.application.port.out.EmployeeReaderPort;
import com.acme.compensation.shared.exception.BusinessException;
import com.acme.compensation.shared.util.CsvSanitizer;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditService implements SalaryAuditWriterPort {

    private final AuditRepositoryPort auditRepository;
    private final EmployeeReaderPort employeeReader;

    @Override
    @Transactional(propagation = Propagation.MANDATORY)
    public void recordAudit(
            Long employeeId,
            Long changedByUserId,
            String changedByEmail,
            BigDecimal previousBaseSalary,
            BigDecimal newBaseSalary,
            BigDecimal previousBonus,
            BigDecimal newBonus,
            String currency,
            String changeReason,
            LocalDate effectiveDate) {

        SalaryAuditLog logEntry = SalaryAuditLog.builder()
                .employeeId(employeeId)
                .changedBy(changedByUserId)
                .changedByEmail(changedByEmail)
                .previousBaseSalary(previousBaseSalary)
                .newBaseSalary(newBaseSalary)
                .previousBonus(previousBonus)
                .newBonus(newBonus)
                .currency(currency)
                .changeReason(changeReason)
                .effectiveDate(effectiveDate)
                .changedAt(Instant.now())
                .build();

        auditRepository.save(logEntry);
        log.info("Recorded salary audit log for employeeId: {}, changedBy: {}", employeeId, changedByEmail);
    }

    @Transactional(readOnly = true)
    public AuditResponses.AuditLogPageResponse searchAuditLogs(
            Long employeeId, Instant startDate, Instant endDate, Pageable pageable) {

        Page<SalaryAuditLog> page = auditRepository.searchAuditLogs(employeeId, startDate, endDate, pageable);

        List<AuditResponses.AuditLogResponse> content = page.getContent().stream()
                .map(this::mapToResponse)
                .toList();

        return AuditResponses.AuditLogPageResponse.builder()
                .content(content)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public void exportAuditLogsCsv(Long employeeId, Instant startDate, Instant endDate, OutputStream outputStream) {
        try (PrintWriter writer = new PrintWriter(new OutputStreamWriter(outputStream, StandardCharsets.UTF_8));
             CSVPrinter csvPrinter = new CSVPrinter(writer, CSVFormat.DEFAULT.builder()
                     .setHeader("Audit ID", "Employee ID", "Employee Code", "Employee Name",
                             "Changed By", "Previous Base Salary", "New Base Salary",
                             "Salary Delta", "% Change", "Currency", "Change Reason",
                             "Effective Date", "Timestamp")
                     .build())) {

            List<SalaryAuditLog> logs = auditRepository.findAllFiltered(employeeId, startDate, endDate);

            for (SalaryAuditLog a : logs) {
                var empSummary = employeeReader.findSummaryById(a.getEmployeeId()).orElse(null);
                BigDecimal delta = a.getNewBaseSalary().subtract(a.getPreviousBaseSalary());
                Double pctChange = 0.0;
                if (a.getPreviousBaseSalary().compareTo(BigDecimal.ZERO) > 0) {
                    pctChange = delta.divide(a.getPreviousBaseSalary(), 4, RoundingMode.HALF_UP)
                            .multiply(BigDecimal.valueOf(100)).doubleValue();
                }

                csvPrinter.printRecord(
                        a.getId(),
                        a.getEmployeeId(),
                        empSummary != null ? CsvSanitizer.sanitize(empSummary.employeeCode()) : "",
                        empSummary != null ? CsvSanitizer.sanitize(empSummary.fullName()) : "",
                        CsvSanitizer.sanitize(a.getChangedByEmail()),
                        a.getPreviousBaseSalary(),
                        a.getNewBaseSalary(),
                        delta,
                        String.format("%.2f%%", pctChange),
                        a.getCurrency(),
                        CsvSanitizer.sanitize(a.getChangeReason()),
                        a.getEffectiveDate(),
                        a.getChangedAt()
                );
            }
            csvPrinter.flush();
        } catch (Exception ex) {
            log.error("Error generating audit logs CSV export", ex);
            throw new BusinessException("Failed to export audit logs CSV: " + ex.getMessage());
        }
    }

    private AuditResponses.AuditLogResponse mapToResponse(SalaryAuditLog logEntry) {
        var empSummary = employeeReader.findSummaryById(logEntry.getEmployeeId()).orElse(null);
        BigDecimal delta = logEntry.getNewBaseSalary().subtract(logEntry.getPreviousBaseSalary());
        Double pctChange = 0.0;
        if (logEntry.getPreviousBaseSalary().compareTo(BigDecimal.ZERO) > 0) {
            pctChange = delta.divide(logEntry.getPreviousBaseSalary(), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100)).doubleValue();
        }

        return AuditResponses.AuditLogResponse.builder()
                .id(logEntry.getId())
                .employeeId(logEntry.getEmployeeId())
                .employeeCode(empSummary != null ? empSummary.employeeCode() : null)
                .employeeName(empSummary != null ? empSummary.fullName() : null)
                .changedByUserId(logEntry.getChangedBy())
                .changedByEmail(logEntry.getChangedByEmail())
                .previousBaseSalary(logEntry.getPreviousBaseSalary())
                .newBaseSalary(logEntry.getNewBaseSalary())
                .previousBonus(logEntry.getPreviousBonus())
                .newBonus(logEntry.getNewBonus())
                .salaryDelta(delta)
                .percentageChange(pctChange)
                .currency(logEntry.getCurrency())
                .changeReason(logEntry.getChangeReason())
                .effectiveDate(logEntry.getEffectiveDate())
                .changedAt(logEntry.getChangedAt())
                .build();
    }
}
