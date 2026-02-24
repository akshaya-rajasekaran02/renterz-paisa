package com.RenterzPaizza.RenterzPaizza.dto;

import com.RenterzPaizza.RenterzPaizza.entity.enums.EntityStatus;
import com.RenterzPaizza.RenterzPaizza.entity.enums.OccupancyType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class UnitAllocationResponse {
    private Long allocationId;
    private Long unitId;
    private Long tenantId;
    private OccupancyType occupancyType;
    private LocalDate startDate;
    private LocalDate endDate;
    private EntityStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
