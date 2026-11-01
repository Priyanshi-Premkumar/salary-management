package com.acme.compensation.compensation.infrastructure.persistence;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface JpaCompensationRepository extends JpaRepository<CompensationEntity, Long> {

    @Query("SELECT c FROM CompensationEntity c WHERE c.employeeId = :employeeId " +
           "AND c.effectiveFrom <= :asOfDate " +
           "AND (c.effectiveTo IS NULL OR c.effectiveTo >= :asOfDate) " +
           "ORDER BY c.effectiveFrom DESC")
    List<CompensationEntity> findActiveCompensationList(
            @Param("employeeId") Long employeeId,
            @Param("asOfDate") LocalDate asOfDate);

    default Optional<CompensationEntity> findActiveCompensation(Long employeeId, LocalDate asOfDate) {
        List<CompensationEntity> list = findActiveCompensationList(employeeId, asOfDate);
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }

    @Query("SELECT c FROM CompensationEntity c WHERE c.employeeId IN :employeeIds " +
           "AND c.effectiveFrom <= :asOfDate " +
           "AND (c.effectiveTo IS NULL OR c.effectiveTo >= :asOfDate)")
    List<CompensationEntity> findActiveForEmployees(
            @Param("employeeIds") Collection<Long> employeeIds,
            @Param("asOfDate") LocalDate asOfDate);

    List<CompensationEntity> findByEmployeeIdOrderByEffectiveFromAsc(Long employeeId);

    List<CompensationEntity> findByEmployeeIdOrderByEffectiveFromDesc(Long employeeId);

    @Query("SELECT c FROM CompensationEntity c " +
           "WHERE c.effectiveFrom <= :asOfDate " +
           "AND (c.effectiveTo IS NULL OR c.effectiveTo >= :asOfDate) " +
           "ORDER BY c.employeeId ASC")
    List<CompensationEntity> findAllActive(@Param("asOfDate") LocalDate asOfDate);
}
