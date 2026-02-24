package com.RenterzPaizza.RenterzPaizza.repository;

import com.RenterzPaizza.RenterzPaizza.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Page<Payment> findByUserUserIdAndDeletedFalse(Long userId, Pageable pageable);

    Page<Payment> findByDeletedFalse(Pageable pageable);

    List<Payment> findByDeletedFalse();
}
