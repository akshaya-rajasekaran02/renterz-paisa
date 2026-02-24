package com.RenterzPaizza.RenterzPaizza.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserImageRequest {

    @NotBlank(message = "Image URL is required")
    @Size(max = 2048, message = "Image URL is too long")
    private String profileImageUrl;
}
