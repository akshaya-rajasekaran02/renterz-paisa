package com.RenterzPaizza.RenterzPaizza.service;

import com.RenterzPaizza.RenterzPaizza.dto.RegisterRequest;
import com.RenterzPaizza.RenterzPaizza.dto.UserResponse;
import com.RenterzPaizza.RenterzPaizza.entity.User;
import com.RenterzPaizza.RenterzPaizza.entity.enums.Role;
import com.RenterzPaizza.RenterzPaizza.exception.BadRequestException;
import com.RenterzPaizza.RenterzPaizza.exception.NotFoundException;
import com.RenterzPaizza.RenterzPaizza.mapper.UserMapper;
import com.RenterzPaizza.RenterzPaizza.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;

@Service
public class UserService {

    private final UserMapper userMapper;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CurrentUserService currentUserService;

    public UserService(UserMapper userMapper,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            CurrentUserService currentUserService) {
        this.userMapper = userMapper;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.currentUserService = currentUserService;
    }

    @Transactional
    public UserResponse createByAdmin(RegisterRequest request, Role role) {
        if (role == Role.ADMIN) {
            throw new BadRequestException("Admin creation from API is not allowed");
        }
        if (userRepository.existsByEmailAndDeletedFalse(request.getEmail().toLowerCase())) {
            throw new BadRequestException("Email already registered");
        }
        if (userRepository.existsByMobileAndDeletedFalse(request.getMobile())) {
            throw new BadRequestException("Mobile already registered");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail().toLowerCase())
                .mobile(request.getMobile())
                .password(passwordEncoder.encode(request.getPassword()))
                .profileImageUrl(request.getProfileImageUrl())
                .role(role)
                .active(true)
                .build();

        return userMapper.toResponse(userRepository.save(user));
    }

    public Page<UserResponse> listUsers(Role role, Pageable pageable) {
        Page<User> page = role == null
                ? userRepository.findByDeletedFalse(pageable)
                : userRepository.findByRoleAndDeletedFalse(role, pageable);

        return page.map(userMapper::toResponse);
    }

    public UserResponse myProfile() {
        return userMapper.toResponse(currentUserService.getCurrentUser());
    }

    @Transactional
    public UserResponse updateMyProfileImage(String profileImageUrl) {
        User user = currentUserService.getCurrentUser();
        user.setProfileImageUrl(profileImageUrl);
        return userMapper.toResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse updateMyProfile(String fullName, String email, String mobile) {
        User user = currentUserService.getCurrentUser();

        if (fullName != null && !fullName.trim().isEmpty()) {
            user.setName(fullName.trim());
        }
        if (email != null && !email.trim().isEmpty()) {
            user.setEmail(email.trim().toLowerCase());
        }
        if (mobile != null) {
            user.setMobile(mobile.trim());
        }

        return userMapper.toResponse(userRepository.save(user));
    }

    /**
     * Soft-deletes a user so they are excluded from future queries and login.
     */
    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .filter(u -> !Boolean.TRUE.equals(u.getDeleted()))
                .orElseThrow(() -> new NotFoundException("User not found"));
        user.setDeleted(true);
        user.setActive(false);
        userRepository.save(user);
    }

    /**
     * Generates and sets a temporary password, returning the plain value once.
     */
    @Transactional
    public String resetPassword(Long userId) {
        User user = userRepository.findById(userId)
                .filter(u -> !Boolean.TRUE.equals(u.getDeleted()))
                .orElseThrow(() -> new NotFoundException("User not found"));
        String temporaryPassword = generateTemporaryPassword();
        user.setPassword(passwordEncoder.encode(temporaryPassword));
        userRepository.save(user);
        return temporaryPassword;
    }

    /**
     * Builds a readable temporary password with mixed characters.
     */
    private String generateTemporaryPassword() {
        final String alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
        SecureRandom random = new SecureRandom();
        StringBuilder builder = new StringBuilder("Temp@");
        for (int i = 0; i < 8; i++) {
            builder.append(alphabet.charAt(random.nextInt(alphabet.length())));
        }
        return builder.toString();
    }
}
