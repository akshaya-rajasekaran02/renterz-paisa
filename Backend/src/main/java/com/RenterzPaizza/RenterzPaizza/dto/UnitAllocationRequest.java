package com.RenterzPaizza.RenterzPaizza.dto;

import com.RenterzPaizza.RenterzPaizza.entity.enums.OccupancyType;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class UnitAllocationRequest {
    @NotNull(message = "Unit id is required")
    private Long unitId;

    @NotNull(message = "Tenant id is required")
    private Long tenantId;

    @NotNull(message = "Occupancy type is required")
    private OccupancyType occupancyType;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    @Future(message = "End date must be in future")
    private LocalDate endDate;
}
