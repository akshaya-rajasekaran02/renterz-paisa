package com.RenterzPaizza.RenterzPaizza.repository;

import com.RenterzPaizza.RenterzPaizza.entity.Communication;
import com.RenterzPaizza.RenterzPaizza.entity.enums.CommunicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CommunicationRepository extends JpaRepository<Communication, Long> {
    List<Communication> findByStatusAndDeletedFalse(CommunicationStatus status);
    Page<Communication> findByUserUserIdAndDeletedFalse(Long userId, Pageable pageable);
    Optional<Communication> findByCommunicationIdAndDeletedFalse(Long communicationId);
}
