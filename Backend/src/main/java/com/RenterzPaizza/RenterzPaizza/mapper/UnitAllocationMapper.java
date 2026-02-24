package com.RenterzPaizza.RenterzPaizza.mapper;

import com.RenterzPaizza.RenterzPaizza.dto.UnitAllocationResponse;
import com.RenterzPaizza.RenterzPaizza.entity.UnitAllocation;
import org.springframework.stereotype.Component;

@Component
public class UnitAllocationMapper {
    public UnitAllocationResponse toResponse(UnitAllocation allocation) {
        return UnitAllocationResponse.builder()
                .allocationId(allocation.getAllocationId())
                .unitId(allocation.getUnit().getUnitId())
                .tenantId(allocation.getTenant().getUserId())
                .occupancyType(allocation.getOccupancyType())
                .startDate(allocation.getStartDate())
                .endDate(allocation.getEndDate())
                .status(allocation.getStatus())
                .createdAt(allocation.getCreatedAt())
                .updatedAt(allocation.getUpdatedAt())
                .build();
    }
}
