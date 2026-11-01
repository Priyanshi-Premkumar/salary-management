package com.acme.compensation.security.application;

import com.acme.compensation.security.domain.UserEntity;
import com.acme.compensation.security.domain.UserRepository;
import com.acme.compensation.shared.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public AuthResponses.AuthResponse login(AuthRequests.LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail().trim().toLowerCase(), request.getPassword()));

            SecurityUserPrincipal principal = (SecurityUserPrincipal) authentication.getPrincipal();
            if (!principal.isEnabled()) {
                throw new ValidationException("User account is inactive. Please contact your system administrator.");
            }

            String token = tokenProvider.generateToken(principal);

            return AuthResponses.AuthResponse.builder()
                    .token(token)
                    .user(AuthResponses.UserDto.builder()
                            .id(principal.getId())
                            .email(principal.getEmail())
                            .role(principal.getRole())
                            .build())
                    .build();
        } catch (BadCredentialsException ex) {
            log.warn("Failed login attempt for email: {}", request.getEmail());
            throw new BadCredentialsException("Invalid email or password");
        }
    }

    @Transactional(readOnly = true)
    public AuthResponses.UserDto getCurrentUser(String email) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("User not found"));
        return AuthResponses.UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }
}
