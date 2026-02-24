package com.RenterzPaizza.RenterzPaizza.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String email;
    private String role;
    private Long userId;
}
