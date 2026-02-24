package com.RenterzPaizza.RenterzPaizza.repository;

import com.RenterzPaizza.RenterzPaizza.entity.Property;
import com.RenterzPaizza.RenterzPaizza.entity.enums.EntityStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PropertyRepository extends JpaRepository<Property, Long> {
    Page<Property> findByDeletedFalse(Pageable pageable);
    Page<Property> findByCityContainingIgnoreCaseAndDeletedFalse(String city, Pageable pageable);
    Page<Property> findByStatusAndDeletedFalse(EntityStatus status, Pageable pageable);
}
