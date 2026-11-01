package com.acme.compensation.compensation.api;

import com.acme.compensation.compensation.application.dto.CompensationDto;
import com.acme.compensation.compensation.application.service.CompensationService;
import com.acme.compensation.security.application.SecurityUserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

@Tag(name = "Compensation", description = "Endpoints for employee compensation management, salary revisions, and history")
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class CompensationController {

    private final CompensationService compensationService;

    @Operation(summary = "Get current active compensation for an employee")
    @GetMapping("/employees/{id}/compensation")
    @PreAuthorize("hasAnyRole('HR_MANAGER', 'ADMIN')")
    public ResponseEntity<CompensationDto.CompensationResponse> getActiveCompensation(@PathVariable Long id) {
        return ResponseEntity.ok(compensationService.getActiveCompensation(id));
    }

    @Operation(summary = "Revise employee compensation (atomic transaction with audit record)")
    @PostMapping("/employees/{id}/compensation")
    @PreAuthorize("hasAnyRole('HR_MANAGER', 'ADMIN')")
    public ResponseEntity<CompensationDto.CompensationResponse> reviseCompensation(
            @PathVariable Long id,
            @Valid @RequestBody CompensationDto.ReviseCompensationRequest request,
            @AuthenticationPrincipal SecurityUserPrincipal principal) {

        Long actorId = principal != null ? principal.getId() : null;
        String actorEmail = principal != null ? principal.getEmail() : "system@acme.com";

        CompensationDto.CompensationResponse response = compensationService.reviseCompensation(
                id, request, actorId, actorEmail);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Get complete historical compensation revision timeline for an employee")
    @GetMapping("/employees/{id}/salary-history")
    @PreAuthorize("hasAnyRole('HR_MANAGER', 'ADMIN')")
    public ResponseEntity<List<CompensationDto.CompensationHistoryItem>> getCompensationHistory(@PathVariable Long id) {
        return ResponseEntity.ok(compensationService.getCompensationHistory(id));
    }

    @Operation(summary = "Export all active compensation records to CSV")
    @GetMapping(value = "/compensation/export", produces = "text/csv")
    @PreAuthorize("hasAnyRole('HR_MANAGER', 'ADMIN')")
    public ResponseEntity<StreamingResponseBody> exportCompensation(HttpServletResponse response) {
        response.setContentType("text/csv");
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"compensation_export.csv\"");

        StreamingResponseBody stream = compensationService::exportCompensationCsv;

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(stream);
    }
}
