package com.acme.compensation.employee.application.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.*;

public class EmployeeRequests {

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateEmployeeRequest {
        @NotBlank(message = "Employee code is required")
        @Size(max = 30, message = "Employee code cannot exceed 30 characters")
        private String employeeCode;

        @NotBlank(message = "First name is required")
        @Size(max = 100, message = "First name cannot exceed 100 characters")
        private String firstName;

        @NotBlank(message = "Last name is required")
        @Size(max = 100, message = "Last name cannot exceed 100 characters")
        private String lastName;

        @NotBlank(message = "Email is required")
        @Email(message = "Must be a valid email address")
        private String email;

        private String phone;

        @NotBlank(message = "Country is required")
        private String country;

        @NotBlank(message = "Department is required")
        private String department;

        @NotBlank(message = "Designation is required")
        private String designation;

        @NotBlank(message = "Employment status is required")
        private String employmentStatus;

        @NotNull(message = "Joining date is required")
        private LocalDate joiningDate;

        @NotNull(message = "Initial base salary is required")
        @DecimalMin(value = "0.01", message = "Base salary must be greater than zero")
        private BigDecimal initialBaseSalary;

        @NotNull(message = "Initial bonus is required")
        @DecimalMin(value = "0.00", message = "Bonus cannot be negative")
        private BigDecimal initialBonus;

        @NotBlank(message = "Currency is required")
        private String currency;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateEmployeeRequest {
        @NotBlank(message = "First name is required")
        private String firstName;

        @NotBlank(message = "Last name is required")
        private String lastName;

        private String phone;

        @NotBlank(message = "Country is required")
        private String country;

        @NotBlank(message = "Department is required")
        private String department;

        @NotBlank(message = "Designation is required")
        private String designation;

        @NotBlank(message = "Employment status is required")
        private String employmentStatus;
    }
}
