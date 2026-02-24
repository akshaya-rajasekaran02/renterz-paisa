package com.RenterzPaizza.RenterzPaizza.repository;

import com.RenterzPaizza.RenterzPaizza.entity.UnitAllocation;
import com.RenterzPaizza.RenterzPaizza.entity.enums.EntityStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface UnitAllocationRepository extends JpaRepository<UnitAllocation, Long> {
    Page<UnitAllocation> findByDeletedFalse(Pageable pageable);
    Page<UnitAllocation> findByUnitOwnerUserIdAndDeletedFalse(Long ownerId, Pageable pageable);
    Page<UnitAllocation> findByTenantUserIdAndDeletedFalse(Long tenantId, Pageable pageable);
    List<UnitAllocation> findByStatusAndDeletedFalse(EntityStatus status);
    List<UnitAllocation> findByStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqualAndDeletedFalse(
            EntityStatus status,
            LocalDate startDate,
            LocalDate endDate
    );
}
