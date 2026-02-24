package com.RenterzPaizza.RenterzPaizza.repository;

import com.RenterzPaizza.RenterzPaizza.entity.DamageReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DamageRepository extends JpaRepository<DamageReport, Long> {
    Page<DamageReport> findByUserUserIdAndDeletedFalse(Long userId, Pageable pageable);
    Page<DamageReport> findByUnitOwnerUserIdAndDeletedFalse(Long ownerId, Pageable pageable);
}
