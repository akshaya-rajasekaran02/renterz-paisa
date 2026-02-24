package com.RenterzPaizza.RenterzPaizza.repository;

import com.RenterzPaizza.RenterzPaizza.entity.Rent;
import com.RenterzPaizza.RenterzPaizza.entity.UnitAllocation;
import com.RenterzPaizza.RenterzPaizza.entity.enums.BillingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface RentRepository extends JpaRepository<Rent, Long> {
    boolean existsByAllocationAndBillingMonthAndDeletedFalse(UnitAllocation allocation, String billingMonth);
    Page<Rent> findByAllocationTenantUserIdAndDeletedFalse(Long tenantId, Pageable pageable);
    Page<Rent> findByAllocationUnitOwnerUserIdAndDeletedFalse(Long ownerId, Pageable pageable);
    List<Rent> findByStatusAndDueDateBeforeAndDeletedFalse(BillingStatus status, LocalDate dueDate);
}
