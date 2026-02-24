package com.RenterzPaizza.RenterzPaizza.repository;

import com.RenterzPaizza.RenterzPaizza.entity.User;
import com.RenterzPaizza.RenterzPaizza.entity.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailAndDeletedFalse(String email);
    boolean existsByEmailAndDeletedFalse(String email);
    boolean existsByMobileAndDeletedFalse(String mobile);
    Page<User> findByRoleAndDeletedFalse(Role role, Pageable pageable);
    Page<User> findByDeletedFalse(Pageable pageable);
}
