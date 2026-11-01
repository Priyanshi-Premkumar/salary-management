package com.acme.compensation.compensation.application.service;

import com.acme.compensation.audit.application.port.in.SalaryAuditWriterPort;
import com.acme.compensation.compensation.application.dto.CompensationDto;
import com.acme.compensation.compensation.application.port.out.CompensationRepositoryPort;
import com.acme.compensation.compensation.domain.Compensation;
import com.acme.compensation.employee.application.port.out.EmployeeReaderPort;
import com.acme.compensation.employee.application.port.out.EmployeeRepositoryPort;
import com.acme.compensation.employee.domain.Employee;
import com.acme.compensation.shared.domain.CurrencyCode;
import com.acme.compensation.shared.exception.BusinessException;
import com.acme.compensation.shared.exception.ResourceNotFoundException;
import com.acme.compensation.shared.exception.ValidationException;
import com.acme.compensation.shared.port.CompensationInitPort;
import com.acme.compensation.shared.port.CompensationLookupPort;
import com.acme.compensation.shared.util.CsvSanitizer;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CompensationService implements CompensationLookupPort, CompensationInitPort {

    private final CompensationRepositoryPort compensationRepository;
    private final EmployeeRepositoryPort employeeRepository;
    private final EmployeeReaderPort employeeReader;
    private final SalaryAuditWriterPort auditWriter;

    @Override
    @Transactional
    public void initializeCompensation(
            Long employeeId, BigDecimal baseSalary, BigDecimal bonus, String currency, LocalDate effectiveFrom) {
        CurrencyCode currencyCode = CurrencyCode.fromString(currency);

        Compensation domain = Compensation.builder()
                .employeeId(employeeId)
                .baseSalary(baseSalary.setScale(4, RoundingMode.HALF_UP))
                .bonus(bonus != null ? bonus.setScale(4, RoundingMode.HALF_UP) : BigDecimal.ZERO.setScale(4, RoundingMode.HALF_UP))
                .currency(currencyCode)
                .effectiveFrom(effectiveFrom)
                .effectiveTo(null)
                .build();

        compensationRepository.save(domain);
        log.info("Initialized compensation for employeeId: {} from: {}", employeeId, effectiveFrom);
    }

    @Transactional
    public CompensationDto.CompensationResponse reviseCompensation(
            Long employeeId,
            CompensationDto.ReviseCompensationRequest request,
            Long actorUserId,
            String actorEmail) {

        // 1. Pessimistic write lock on parent employee row to serialize revisions for this employee
        Employee employee = employeeRepository.findByIdForUpdate(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", employeeId));

        if (!employee.isActive()) {
            throw new ValidationException("Cannot revise compensation for employee with status: " + employee.getEmploymentStatus());
        }

        LocalDate revisionDate = request.getEffectiveFrom();
        if (revisionDate.isBefore(employee.getJoiningDate())) {
            throw new ValidationException(String.format(
                    "Revision effective date (%s) cannot be earlier than employee joining date (%s)",
                    revisionDate, employee.getJoiningDate()));
        }

        CurrencyCode currency = CurrencyCode.fromString(request.getCurrency());
        BigDecimal newBase = request.getNewBaseSalary().setScale(4, RoundingMode.HALF_UP);
        BigDecimal newBonus = request.getNewBonus().setScale(4, RoundingMode.HALF_UP);

        // 2. Fetch existing compensation history in chronological order
        List<Compensation> history = compensationRepository.findByEmployeeIdOrderByEffectiveFromAsc(employeeId);

        if (history.isEmpty()) {
            throw new BusinessException("No existing compensation record found to revise for employee: " + employeeId);
        }

        // 3. Find existing record that encompasses revision date or is latest
        Compensation activeToClose = null;
        Compensation nextFutureRecord = null;

        for (Compensation c : history) {
            if (c.getEffectiveFrom().equals(revisionDate)) {
                throw new ValidationException("A compensation revision already starts exactly on " + revisionDate + ". Choose a different effective date.");
            }

            boolean encompasses = !c.getEffectiveFrom().isAfter(revisionDate) &&
                                  (c.getEffectiveTo() == null || !c.getEffectiveTo().isBefore(revisionDate));
            if (encompasses) {
                activeToClose = c;
            }

            if (c.getEffectiveFrom().isAfter(revisionDate) && (nextFutureRecord == null || c.getEffectiveFrom().isBefore(nextFutureRecord.getEffectiveFrom()))) {
                nextFutureRecord = c;
            }
        }

        BigDecimal prevBase;
        BigDecimal prevBonus;

        if (activeToClose != null) {
            prevBase = activeToClose.getBaseSalary();
            prevBonus = activeToClose.getBonus();
            // Close old record day before new revision starts
            Compensation closed = activeToClose.toBuilder()
                    .effectiveTo(revisionDate.minusDays(1))
                    .build();
            compensationRepository.saveAndFlush(closed);
        } else {
            // If revising beyond latest record
            Compensation latest = history.get(history.size() - 1);
            prevBase = latest.getBaseSalary();
            prevBonus = latest.getBonus();
            if (latest.getEffectiveTo() == null) {
                Compensation closed = latest.toBuilder()
                        .effectiveTo(revisionDate.minusDays(1))
                        .build();
                compensationRepository.saveAndFlush(closed);
            }
        }

        // 4. Create new compensation record
        LocalDate newEffectiveTo = nextFutureRecord != null ? nextFutureRecord.getEffectiveFrom().minusDays(1) : null;

        Compensation newComp = Compensation.builder()
                .employeeId(employeeId)
                .baseSalary(newBase)
                .bonus(newBonus)
                .currency(currency)
                .effectiveFrom(revisionDate)
                .effectiveTo(newEffectiveTo)
                .build();

        Compensation saved = compensationRepository.save(newComp);

        // 5. Commit audit record atomically within the SAME transaction
        auditWriter.recordAudit(
                employeeId,
                actorUserId,
                actorEmail,
                prevBase,
                newBase,
                prevBonus,
                newBonus,
                currency.name(),
                request.getReason().trim(),
                revisionDate
        );

        log.info("Successfully revised compensation for employeeId: {}, newBase: {}, effectiveFrom: {}", employeeId, newBase, revisionDate);

        LocalDate today = LocalDate.now();
        boolean isActive = !today.isBefore(saved.getEffectiveFrom()) && (saved.getEffectiveTo() == null || !today.isAfter(saved.getEffectiveTo()));
        boolean isFuture = saved.getEffectiveFrom().isAfter(today);
        boolean isHist = saved.getEffectiveTo() != null && saved.getEffectiveTo().isBefore(today);

        return mapToResponse(saved, isActive, isFuture, isHist);
    }

    @Transactional(readOnly = true)
    public CompensationDto.CompensationResponse getActiveCompensation(Long employeeId) {
        LocalDate today = LocalDate.now();
        Compensation entity = compensationRepository.findActiveCompensation(employeeId, today)
                .orElseThrow(() -> new ResourceNotFoundException("Active compensation for employee", employeeId));
        return mapToResponse(entity, true, false, false);
    }

    @Transactional(readOnly = true)
    public List<CompensationDto.CompensationHistoryItem> getCompensationHistory(Long employeeId) {
        List<Compensation> records = compensationRepository.findByEmployeeIdOrderByEffectiveFromDesc(employeeId);
        LocalDate today = LocalDate.now();

        List<CompensationDto.CompensationHistoryItem> items = new ArrayList<>();
        // Records sorted descending by effectiveFrom
        for (int i = 0; i < records.size(); i++) {
            Compensation curr = records.get(i);
            Compensation prev = (i + 1 < records.size()) ? records.get(i + 1) : null;

            String status;
            if (curr.getEffectiveFrom().isAfter(today)) {
                status = "FUTURE";
            } else if (curr.getEffectiveTo() != null && curr.getEffectiveTo().isBefore(today)) {
                status = "HISTORICAL";
            } else {
                status = "CURRENT";
            }

            BigDecimal delta = null;
            Double pctChange = null;
            if (prev != null) {
                delta = curr.getBaseSalary().subtract(prev.getBaseSalary());
                if (prev.getBaseSalary().compareTo(BigDecimal.ZERO) > 0) {
                    pctChange = delta.divide(prev.getBaseSalary(), 4, RoundingMode.HALF_UP)
                            .multiply(BigDecimal.valueOf(100)).doubleValue();
                }
            }

            items.add(CompensationDto.CompensationHistoryItem.builder()
                    .id(curr.getId())
                    .employeeId(curr.getEmployeeId())
                    .baseSalary(curr.getBaseSalary())
                    .bonus(curr.getBonus())
                    .totalCompensation(curr.getBaseSalary().add(curr.getBonus()))
                    .currency(curr.getCurrency().name())
                    .effectiveFrom(curr.getEffectiveFrom())
                    .effectiveTo(curr.getEffectiveTo())
                    .status(status)
                    .deltaFromPrevious(delta)
                    .percentageChange(pctChange)
                    .build());
        }
        return items;
    }

    @Transactional(readOnly = true)
    public void exportCompensationCsv(OutputStream outputStream) {
        LocalDate today = LocalDate.now();
        try (PrintWriter writer = new PrintWriter(new OutputStreamWriter(outputStream, StandardCharsets.UTF_8));
             CSVPrinter csvPrinter = new CSVPrinter(writer, CSVFormat.DEFAULT.builder()
                     .setHeader("Employee Code", "Employee Name", "Department", "Country",
                             "Base Salary", "Bonus", "Total Compensation", "Currency",
                             "Effective From", "Effective To")
                     .build())) {

            List<Compensation> list = compensationRepository.findAllActive(today);

            for (Compensation c : list) {
                var empSummary = employeeReader.findSummaryById(c.getEmployeeId()).orElse(null);
                csvPrinter.printRecord(
                        empSummary != null ? CsvSanitizer.sanitize(empSummary.employeeCode()) : "",
                        empSummary != null ? CsvSanitizer.sanitize(empSummary.fullName()) : "",
                        empSummary != null ? CsvSanitizer.sanitize(empSummary.department()) : "",
                        empSummary != null ? CsvSanitizer.sanitize(empSummary.country()) : "",
                        c.getBaseSalary(),
                        c.getBonus(),
                        c.getBaseSalary().add(c.getBonus()),
                        c.getCurrency().name(),
                        c.getEffectiveFrom(),
                        c.getEffectiveTo() != null ? c.getEffectiveTo() : "Current"
                );
            }
            csvPrinter.flush();
        } catch (Exception ex) {
            log.error("Error exporting compensation CSV", ex);
            throw new BusinessException("Failed to export compensation CSV: " + ex.getMessage());
        }
    }

    // CompensationLookupPort implementations (for cross-module consumption)
    @Override
    @Transactional(readOnly = true)
    public Optional<ActiveCompensationSummary> findActiveCompensation(Long employeeId) {
        return compensationRepository.findActiveCompensation(employeeId, LocalDate.now())
                .map(c -> new ActiveCompensationSummary(
                        c.getEmployeeId(),
                        c.getBaseSalary(),
                        c.getBonus(),
                        c.getCurrency().name(),
                        c.getEffectiveFrom()
                ));
    }

    @Override
    @Transactional(readOnly = true)
    public Map<Long, ActiveCompensationSummary> findActiveCompensationForEmployees(Collection<Long> employeeIds) {
        if (employeeIds == null || employeeIds.isEmpty()) {
            return Collections.emptyMap();
        }
        List<Compensation> list = compensationRepository.findActiveForEmployees(employeeIds, LocalDate.now());
        return list.stream()
                .collect(Collectors.toMap(
                        Compensation::getEmployeeId,
                        c -> new ActiveCompensationSummary(
                                c.getEmployeeId(),
                                c.getBaseSalary(),
                                c.getBonus(),
                                c.getCurrency().name(),
                                c.getEffectiveFrom()
                        ),
                        (existing, replacement) -> existing
                ));
    }

    private CompensationDto.CompensationResponse mapToResponse(
            Compensation domain, boolean isActive, boolean isFuture, boolean isHistorical) {
        return CompensationDto.CompensationResponse.builder()
                .id(domain.getId())
                .employeeId(domain.getEmployeeId())
                .baseSalary(domain.getBaseSalary())
                .bonus(domain.getBonus())
                .totalCompensation(domain.getBaseSalary().add(domain.getBonus()))
                .currency(domain.getCurrency().name())
                .effectiveFrom(domain.getEffectiveFrom())
                .effectiveTo(domain.getEffectiveTo())
                .active(isActive)
                .future(isFuture)
                .historical(isHistorical)
                .build();
    }
}
