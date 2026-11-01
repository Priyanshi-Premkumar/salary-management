package com.acme.compensation.security.infrastructure;

import com.acme.compensation.security.domain.UserEntity;
import com.acme.compensation.security.domain.UserRepository;
import com.acme.compensation.security.domain.UserRole;
import jakarta.servlet.DispatcherType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Slf4j
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CorsConfigurationSource corsConfigurationSource;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .dispatcherTypeMatchers(DispatcherType.ASYNC, DispatcherType.FORWARD, DispatcherType.ERROR).permitAll()
                        .requestMatchers(
                                "/api/v1/auth/**",
                                "/api/v1/admin/seed-data",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/api-docs/**",
                                "/actuator/health",
                                "/actuator/info"
                        ).permitAll()
                        .requestMatchers("/api/v1/**").authenticated()
                        .anyRequest().permitAll()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CommandLineRunner initDefaultUsers(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (!userRepository.existsByEmail("admin@acme.com")) {
                userRepository.save(UserEntity.builder()
                        .email("admin@acme.com")
                        .passwordHash(passwordEncoder.encode("Admin@123"))
                        .role(UserRole.ROLE_ADMIN)
                        .active(true)
                        .build());
                log.info("Initialized default admin user: admin@acme.com");
            }

            if (!userRepository.existsByEmail("hrmanager@acme.com")) {
                userRepository.save(UserEntity.builder()
                        .email("hrmanager@acme.com")
                        .passwordHash(passwordEncoder.encode("Manager@123"))
                        .role(UserRole.ROLE_HR_MANAGER)
                        .active(true)
                        .build());
                log.info("Initialized default HR manager user: hrmanager@acme.com");
            }

            if (!userRepository.existsByEmail("executive@acme.com")) {
                userRepository.save(UserEntity.builder()
                        .email("executive@acme.com")
                        .passwordHash(passwordEncoder.encode("Executive@123"))
                        .role(UserRole.ROLE_EXECUTIVE)
                        .active(true)
                        .build());
                log.info("Initialized default executive user: executive@acme.com");
            }
        };
    }
}
