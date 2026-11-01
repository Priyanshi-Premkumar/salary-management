package com.acme.compensation.analytics.infrastructure.persistence;

import com.acme.compensation.employee.infrastructure.persistence.EmployeeEntity;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface JpaAnalyticsRepository extends JpaRepository<EmployeeEntity, Long> {

    interface DepartmentSalaryProjection {
        String getDepartment();
        String getCurrency();
        Long getEmployeeCount();
        BigDecimal getAvgBaseSalary();
        BigDecimal getMedianBaseSalary();
        BigDecimal getMinBaseSalary();
        BigDecimal getMaxBaseSalary();
        BigDecimal getAvgBonus();
        BigDecimal getAvgTotalCompensation();
    }

    interface CountrySalaryProjection {
        String getCountry();
        String getCurrency();
        Long getEmployeeCount();
        BigDecimal getAvgBaseSalary();
        BigDecimal getMedianBaseSalary();
        BigDecimal getTotalPayroll();
    }

    @Query(value = "SELECT " +
                   "e.department AS department, " +
                   "c.currency AS currency, " +
                   "COUNT(e.id) AS employeeCount, " +
                   "ROUND(AVG(c.base_salary), 2) AS avgBaseSalary, " +
                   "PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY c.base_salary) AS medianBaseSalary, " +
                   "MIN(c.base_salary) AS minBaseSalary, " +
                   "MAX(c.base_salary) AS maxBaseSalary, " +
                   "ROUND(AVG(c.bonus), 2) AS avgBonus, " +
                   "ROUND(AVG(c.base_salary + c.bonus), 2) AS avgTotalCompensation " +
                   "FROM employees e " +
                   "JOIN compensation c ON e.id = c.employee_id " +
                   "WHERE e.employment_status = 'ACTIVE' " +
                   "  AND c.effective_from <= :asOfDate " +
                   "  AND (c.effective_to IS NULL OR c.effective_to >= :asOfDate) " +
                   "  AND (:currency IS NULL OR c.currency = :currency) " +
                   "GROUP BY e.department, c.currency " +
                   "ORDER BY e.department ASC, c.currency ASC",
           nativeQuery = true)
    List<DepartmentSalaryProjection> getDepartmentSalaryStats(
            @Param("currency") String currency,
            @Param("asOfDate") LocalDate asOfDate);

    @Query(value = "SELECT " +
                   "e.country AS country, " +
                   "c.currency AS currency, " +
                   "COUNT(e.id) AS employeeCount, " +
                   "ROUND(AVG(c.base_salary), 2) AS avgBaseSalary, " +
                   "PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY c.base_salary) AS medianBaseSalary, " +
                   "ROUND(SUM(c.base_salary + c.bonus), 2) AS totalPayroll " +
                   "FROM employees e " +
                   "JOIN compensation c ON e.id = c.employee_id " +
                   "WHERE e.employment_status = 'ACTIVE' " +
                   "  AND c.effective_from <= :asOfDate " +
                   "  AND (c.effective_to IS NULL OR c.effective_to >= :asOfDate) " +
                   "GROUP BY e.country, c.currency " +
                   "ORDER BY e.country ASC",
           nativeQuery = true)
    List<CountrySalaryProjection> getCountrySalaryStats(@Param("asOfDate") LocalDate asOfDate);

    @Query(value = "SELECT COUNT(e.id) " +
                   "FROM employees e " +
                   "JOIN compensation c ON e.id = c.employee_id " +
                   "WHERE e.employment_status = 'ACTIVE' " +
                   "  AND c.currency = :currency " +
                   "  AND c.base_salary >= :threshold " +
                   "  AND c.effective_from <= :asOfDate " +
                   "  AND (c.effective_to IS NULL OR c.effective_to >= :asOfDate)",
           nativeQuery = true)
    Long countEmployeesAboveThreshold(
            @Param("threshold") BigDecimal threshold,
            @Param("currency") String currency,
            @Param("asOfDate") LocalDate asOfDate);

    @Query(value = "SELECT c.base_salary " +
                   "FROM employees e " +
                   "JOIN compensation c ON e.id = c.employee_id " +
                   "WHERE e.employment_status = 'ACTIVE' " +
                   "  AND c.currency = :currency " +
                   "  AND c.effective_from <= :asOfDate " +
                   "  AND (c.effective_to IS NULL OR c.effective_to >= :asOfDate) " +
                   "ORDER BY c.base_salary ASC",
           nativeQuery = true)
    List<BigDecimal> getSalariesForCurrency(
            @Param("currency") String currency,
            @Param("asOfDate") LocalDate asOfDate);

    @Query(value = "SELECT COUNT(DISTINCT employee_id) FROM salary_audit_logs WHERE EXTRACT(YEAR FROM effective_date) = :year",
           nativeQuery = true)
    Long countDistinctEmployeesRevisedInYear(@Param("year") int year);

    @Query("SELECT COUNT(e) FROM EmployeeEntity e WHERE e.employmentStatus = 'ACTIVE'")
    long countActiveEmployees();

    @Query("SELECT COUNT(e) FROM EmployeeEntity e WHERE e.employmentStatus != 'ACTIVE'")
    long countInactiveEmployees();
}
