package com.RenterzPaizza.RenterzPaizza.mapper;

import com.RenterzPaizza.RenterzPaizza.dto.RentResponse;
import com.RenterzPaizza.RenterzPaizza.entity.Rent;
import org.springframework.stereotype.Component;

@Component
public class RentMapper {
    public RentResponse toResponse(Rent rent) {
        return RentResponse.builder()
                .rentId(rent.getRentId())
                .allocationId(rent.getAllocation().getAllocationId())
                .tenantId(rent.getAllocation().getTenant().getUserId())
                .tenantName(rent.getAllocation().getTenant().getName())
                .tenantEmail(rent.getAllocation().getTenant().getEmail())
                .unitId(rent.getAllocation().getUnit().getUnitId())
                .unitNumber(rent.getAllocation().getUnit().getUnitNumber())
                .amount(rent.getAmount())
                .dueDate(rent.getDueDate())
                .status(rent.getStatus())
                .billingMonth(rent.getBillingMonth())
                .createdAt(rent.getCreatedAt())
                .updatedAt(rent.getUpdatedAt())
                .build();
    }
}
