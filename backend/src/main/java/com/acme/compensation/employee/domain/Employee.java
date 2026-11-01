package com.acme.compensation.employee.domain;

import java.time.LocalDate;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder(toBuilder = true)
public class Employee {
    private final Long id;
    private final String employeeCode;
    private final String firstName;
    private final String lastName;
    private final String email;
    private final String phone;
    private final String country;
    private final String department;
    private final String designation;
    private final EmploymentStatus employmentStatus;
    private final LocalDate joiningDate;

    public String getFullName() {
        return firstName + " " + lastName;
    }

    public boolean isActive() {
        return employmentStatus == EmploymentStatus.ACTIVE;
    }

    public boolean isTerminated() {
        return employmentStatus == EmploymentStatus.TERMINATED;
    }
}
