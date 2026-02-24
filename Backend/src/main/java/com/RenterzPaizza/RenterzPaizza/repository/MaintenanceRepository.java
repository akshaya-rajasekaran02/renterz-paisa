package com.RenterzPaizza.RenterzPaizza.repository;

import com.RenterzPaizza.RenterzPaizza.entity.Maintenance;
import com.RenterzPaizza.RenterzPaizza.entity.enums.BillingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MaintenanceRepository extends JpaRepository<Maintenance, Long> {
    Page<Maintenance> findByUnitOwnerUserIdAndDeletedFalse(Long ownerId, Pageable pageable);
    Page<Maintenance> findByStatusAndDeletedFalse(BillingStatus status, Pageable pageable);
}
