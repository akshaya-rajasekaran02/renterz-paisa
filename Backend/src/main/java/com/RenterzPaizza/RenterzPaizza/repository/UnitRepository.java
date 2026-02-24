package com.RenterzPaizza.RenterzPaizza.repository;

import com.RenterzPaizza.RenterzPaizza.entity.Unit;
import com.RenterzPaizza.RenterzPaizza.entity.enums.UnitStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UnitRepository extends JpaRepository<Unit, Long> {
    Page<Unit> findByDeletedFalse(Pageable pageable);
    Page<Unit> findByOwnerUserIdAndDeletedFalse(Long ownerId, Pageable pageable);
    Page<Unit> findByPropertyPropertyIdAndDeletedFalse(Long propertyId, Pageable pageable);
    Page<Unit> findByOwnerUserIdAndStatusAndDeletedFalse(Long ownerId, UnitStatus status, Pageable pageable);
}
