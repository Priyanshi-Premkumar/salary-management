package com.acme.compensation.security.api;

import com.acme.compensation.security.application.AuthRequests;
import com.acme.compensation.security.application.AuthResponses;
import com.acme.compensation.security.application.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.security.Principal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Authentication", description = "Endpoints for HR authentication and session verification")
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "Login with email and password to receive JWT token")
    @PostMapping("/login")
    public ResponseEntity<AuthResponses.AuthResponse> login(@Valid @RequestBody AuthRequests.LoginRequest request) {
        AuthResponses.AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get current authenticated user profile")
    @GetMapping("/me")
    public ResponseEntity<AuthResponses.UserDto> getCurrentUser(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        AuthResponses.UserDto user = authService.getCurrentUser(principal.getName());
        return ResponseEntity.ok(user);
    }
}
