package com.RenterzPaizza.RenterzPaizza.repository;

import com.RenterzPaizza.RenterzPaizza.entity.Complaint;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    Page<Complaint> findByUserUserIdAndDeletedFalse(Long userId, Pageable pageable);

    Page<Complaint> findByUnitOwnerUserIdAndDeletedFalse(Long ownerId, Pageable pageable);

    List<Complaint> findByDeletedFalse();
}
