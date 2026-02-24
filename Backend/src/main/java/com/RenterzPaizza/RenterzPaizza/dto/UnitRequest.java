package com.RenterzPaizza.RenterzPaizza.dto;

import com.RenterzPaizza.RenterzPaizza.entity.enums.UnitType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class UnitRequest {
    @NotBlank(message = "Unit number is required")
    private String unitNumber;

    @NotNull(message = "Unit type is required")
    private UnitType unitType;

    @NotNull(message = "Floor is required")
    @PositiveOrZero(message = "Floor cannot be negative")
    private Integer floor;

    @NotNull(message = "Property id is required")
    private Long propertyId;

    @NotNull(message = "Monthly rent is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Monthly rent must be greater than 0")
    private BigDecimal monthlyRent;
}
