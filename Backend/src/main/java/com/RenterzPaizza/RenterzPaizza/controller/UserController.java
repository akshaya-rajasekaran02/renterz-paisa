package com.RenterzPaizza.RenterzPaizza.controller;

import com.RenterzPaizza.RenterzPaizza.common.ApiResponse;
import com.RenterzPaizza.RenterzPaizza.common.PageMapper;
import com.RenterzPaizza.RenterzPaizza.common.PageResponse;
import com.RenterzPaizza.RenterzPaizza.dto.RegisterRequest;
import com.RenterzPaizza.RenterzPaizza.dto.UserImageRequest;
import com.RenterzPaizza.RenterzPaizza.dto.UserResponse;
import com.RenterzPaizza.RenterzPaizza.entity.enums.Role;
import com.RenterzPaizza.RenterzPaizza.service.UserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/api/admin/users/owners")
    public ApiResponse<UserResponse> createOwner(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.ok("Owner created", userService.createByAdmin(request, Role.OWNER));
    }

    @PostMapping("/api/admin/users/tenants")
    public ApiResponse<UserResponse> createTenant(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.ok("Tenant created", userService.createByAdmin(request, Role.TENANT));
    }

    @GetMapping("/api/admin/users")
    public ApiResponse<PageResponse<UserResponse>> listUsers(@RequestParam(required = false) Role role,
            Pageable pageable) {
        Page<UserResponse> page = userService.listUsers(role, pageable);
        return ApiResponse.ok("Users fetched", PageMapper.toPageResponse(page));
    }

    @DeleteMapping("/api/admin/users/{userId}")
    public ApiResponse<Void> deleteUser(@PathVariable Long userId) {
        userService.deleteUser(userId);
        return ApiResponse.ok("User deleted");
    }

    @PostMapping("/api/admin/users/{userId}/reset-password")
    public ApiResponse<Map<String, String>> resetPassword(@PathVariable Long userId) {
        String temporaryPassword = userService.resetPassword(userId);
        return ApiResponse.ok("Password reset", Map.of("temporaryPassword", temporaryPassword));
    }

    @GetMapping("/api/common/users/me")
    public ApiResponse<UserResponse> myProfile() {
        return ApiResponse.ok("Profile fetched", userService.myProfile());
    }

    @PutMapping("/api/common/users/me")
    public ApiResponse<UserResponse> updateMyProfile(@RequestBody Map<String, String> request) {
        String fullName = request.get("fullName");
        String email = request.get("email");
        String mobile = request.get("mobile");
        return ApiResponse.ok("Profile updated", userService.updateMyProfile(fullName, email, mobile));
    }

    @PutMapping("/api/common/users/me/image")
    public ApiResponse<UserResponse> updateProfileImage(@Valid @RequestBody UserImageRequest request) {
        return ApiResponse.ok("Profile image updated", userService.updateMyProfileImage(request.getProfileImageUrl()));
    }
}
