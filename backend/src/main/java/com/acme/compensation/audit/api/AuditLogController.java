package com.acme.compensation.audit.api;

import com.acme.compensation.audit.application.dto.AuditResponses;
import com.acme.compensation.audit.application.service.AuditService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

@Tag(name = "Audit Logs", description = "Endpoints for immutable salary revision audit history")
@RestController
@RequestMapping("/api/v1/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditService auditService;

    @Operation(summary = "Search, filter, and paginate salary audit logs")
    @GetMapping
    @PreAuthorize("hasAnyRole('HR_MANAGER', 'ADMIN')")
    public ResponseEntity<AuditResponses.AuditLogPageResponse> searchAuditLogs(
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) Instant startDate,
            @RequestParam(required = false) Instant endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "changedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        int boundedSize = Math.min(Math.max(1, size), 100);
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(Math.max(0, page), boundedSize, sort);

        return ResponseEntity.ok(auditService.searchAuditLogs(employeeId, startDate, endDate, pageable));
    }

    @Operation(summary = "Export salary audit logs to CSV")
    @GetMapping(value = "/export", produces = "text/csv")
    @PreAuthorize("hasAnyRole('HR_MANAGER', 'ADMIN')")
    public ResponseEntity<StreamingResponseBody> exportAuditLogs(
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) Instant startDate,
            @RequestParam(required = false) Instant endDate,
            HttpServletResponse response) {

        response.setContentType("text/csv");
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"audit_logs_export.csv\"");

        StreamingResponseBody stream = outputStream -> {
            auditService.exportAuditLogsCsv(employeeId, startDate, endDate, outputStream);
        };

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(stream);
    }
}
