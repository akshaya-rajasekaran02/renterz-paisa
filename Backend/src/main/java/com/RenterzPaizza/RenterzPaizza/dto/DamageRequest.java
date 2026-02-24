package com.RenterzPaizza.RenterzPaizza.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class DamageRequest {
    @NotNull(message = "Unit id is required")
    private Long unitId;

    @NotNull(message = "User id is required")
    private Long userId;

    @NotBlank(message = "Description is required")
    private String description;

    private String beforeImage;
    private String afterImage;

    @NotNull(message = "Estimated cost is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Estimated cost must be greater than 0")
    private BigDecimal estimatedCost;
}
