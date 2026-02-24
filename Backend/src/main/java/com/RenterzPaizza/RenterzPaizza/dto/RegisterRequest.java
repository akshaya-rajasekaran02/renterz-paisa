package com.RenterzPaizza.RenterzPaizza.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {
    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email format is invalid")
    private String email;

    @NotBlank(message = "Mobile is required")
    @Pattern(regexp = "^[0-9]{10,15}$", message = "Mobile must be 10 to 15 digits")
    private String mobile;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 64, message = "Password must be between 8 and 64 characters")
    private String password;

    @Size(max = 2048, message = "Image URL is too long")
    private String profileImageUrl;
}
