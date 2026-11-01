package com.acme.compensation.employee.application.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import lombok.*;

public class EmployeeResponses {

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmployeeResponse {
        private Long id;
        private String employeeCode;
        private String firstName;
        private String lastName;
        private String fullName;
        private String email;
        private String phone;
        private String country;
        private String department;
        private String designation;
        private String employmentStatus;
        private LocalDate joiningDate;
        private BigDecimal currentBaseSalary;
        private BigDecimal currentBonus;
        private String currency;
        private LocalDate compensationEffectiveFrom;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmployeePageResponse {
        private List<EmployeeResponse> content;
        private int page;
        private int size;
        private long totalElements;
        private int totalPages;
        private boolean first;
        private boolean last;
    }
}
