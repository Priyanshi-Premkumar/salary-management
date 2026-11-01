package com.acme.compensation.audit.infrastructure.persistence;

import java.time.Instant;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface JpaAuditLogRepository extends JpaRepository<SalaryAuditLogEntity, Long> {

    @Query("SELECT a FROM SalaryAuditLogEntity a WHERE " +
           "(:employeeId IS NULL OR a.employeeId = :employeeId) " +
           "AND (cast(:startDate as timestamp) IS NULL OR a.changedAt >= :startDate) " +
           "AND (cast(:endDate as timestamp) IS NULL OR a.changedAt <= :endDate) " +
           "ORDER BY a.changedAt DESC")
    Page<SalaryAuditLogEntity> searchAuditLogs(
            @Param("employeeId") Long employeeId,
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate,
            Pageable pageable);

    @Query("SELECT a FROM SalaryAuditLogEntity a WHERE " +
           "(:employeeId IS NULL OR a.employeeId = :employeeId) " +
           "AND (cast(:startDate as timestamp) IS NULL OR a.changedAt >= :startDate) " +
           "AND (cast(:endDate as timestamp) IS NULL OR a.changedAt <= :endDate) " +
           "ORDER BY a.changedAt DESC")
    List<SalaryAuditLogEntity> findAllFiltered(
            @Param("employeeId") Long employeeId,
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate);

    List<SalaryAuditLogEntity> findByEmployeeIdOrderByEffectiveDateDesc(Long employeeId);
}
