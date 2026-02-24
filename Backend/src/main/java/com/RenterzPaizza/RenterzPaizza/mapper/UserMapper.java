package com.RenterzPaizza.RenterzPaizza.mapper;

import com.RenterzPaizza.RenterzPaizza.dto.RegisterRequest;
import com.RenterzPaizza.RenterzPaizza.dto.UserResponse;
import com.RenterzPaizza.RenterzPaizza.entity.User;
import com.RenterzPaizza.RenterzPaizza.entity.enums.Role;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public User toTenantEntity(RegisterRequest request, PasswordEncoder passwordEncoder) {
        return User.builder()
                .name(request.getName())
                .email(request.getEmail().toLowerCase())
                .mobile(request.getMobile())
                .password(passwordEncoder.encode(request.getPassword()))
                .profileImageUrl(request.getProfileImageUrl())
                .role(Role.TENANT)
                .active(true)
                .build();
    }

    public UserResponse toResponse(User user) {
        return UserResponse.builder()
                .userId(user.getUserId())
                .name(user.getName())
                .email(user.getEmail())
                .mobile(user.getMobile())
                .profileImageUrl(user.getProfileImageUrl())
                .role(user.getRole())
                .active(user.getActive())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
