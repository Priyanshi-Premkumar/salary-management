package com.acme.compensation.employee.domain;

public enum EmploymentStatus {
    ACTIVE,
    ON_LEAVE,
    RESIGNED,
    TERMINATED;

    public static EmploymentStatus fromString(String status) {
        if (status == null || status.trim().isEmpty()) {
            return ACTIVE;
        }
        for (EmploymentStatus s : values()) {
            if (s.name().equalsIgnoreCase(status.trim())) {
                return s;
            }
        }
        throw new IllegalArgumentException("Unknown employment status: " + status);
    }
}
