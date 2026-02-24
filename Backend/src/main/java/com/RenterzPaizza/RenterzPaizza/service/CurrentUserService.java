package com.RenterzPaizza.RenterzPaizza.service;

import com.RenterzPaizza.RenterzPaizza.entity.User;
import com.RenterzPaizza.RenterzPaizza.exception.NotFoundException;
import com.RenterzPaizza.RenterzPaizza.security.SecurityUtil;
import com.RenterzPaizza.RenterzPaizza.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class CurrentUserService {

    private final UserRepository userRepository;

    public CurrentUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getCurrentUser() {
        String email = SecurityUtil.getCurrentUserEmail();
        return userRepository.findByEmailAndDeletedFalse(email)
                .orElseThrow(() -> new NotFoundException("Current user not found"));
    }
}
