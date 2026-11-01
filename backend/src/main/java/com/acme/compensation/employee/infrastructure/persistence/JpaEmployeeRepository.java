package com.acme.compensation.employee.infrastructure.persistence;

import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface JpaEmployeeRepository extends JpaRepository<EmployeeEntity, Long>, JpaSpecificationExecutor<EmployeeEntity> {

    Optional<EmployeeEntity> findByEmployeeCode(String employeeCode);

    Optional<EmployeeEntity> findByEmail(String email);

    boolean existsByEmployeeCode(String employeeCode);

    boolean existsByEmail(String email);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT e FROM EmployeeEntity e WHERE e.id = :id")
    Optional<EmployeeEntity> findByIdForUpdate(@Param("id") Long id);

    @Query("SELECT e FROM EmployeeEntity e WHERE " +
           "(:search IS NULL OR LOWER(e.firstName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           " OR LOWER(e.lastName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           " OR LOWER(e.employeeCode) LIKE LOWER(CONCAT('%', :search, '%')) " +
           " OR LOWER(e.email) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:country IS NULL OR e.country = :country) " +
           "AND (:department IS NULL OR e.department = :department) " +
           "AND (:designation IS NULL OR e.designation = :designation) " +
           "AND (:status IS NULL OR e.employmentStatus = :status)")
    Page<EmployeeEntity> search(
            @Param("search") String search,
            @Param("country") String country,
            @Param("department") String department,
            @Param("designation") String designation,
            @Param("status") com.acme.compensation.employee.domain.EmploymentStatus status,
            Pageable pageable);

    @Query("SELECT e FROM EmployeeEntity e WHERE " +
           "(:search IS NULL OR LOWER(e.firstName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           " OR LOWER(e.lastName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           " OR LOWER(e.employeeCode) LIKE LOWER(CONCAT('%', :search, '%')) " +
           " OR LOWER(e.email) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:country IS NULL OR e.country = :country) " +
           "AND (:department IS NULL OR e.department = :department) " +
           "AND (:designation IS NULL OR e.designation = :designation) " +
           "AND (:status IS NULL OR e.employmentStatus = :status)")
    List<EmployeeEntity> findAllFiltered(
            @Param("search") String search,
            @Param("country") String country,
            @Param("department") String department,
            @Param("designation") String designation,
            @Param("status") com.acme.compensation.employee.domain.EmploymentStatus status);
}
