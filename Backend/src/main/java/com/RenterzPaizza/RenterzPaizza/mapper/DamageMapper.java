package com.RenterzPaizza.RenterzPaizza.mapper;

import com.RenterzPaizza.RenterzPaizza.dto.DamageResponse;
import com.RenterzPaizza.RenterzPaizza.entity.DamageReport;
import org.springframework.stereotype.Component;

@Component
public class DamageMapper {
    public DamageResponse toResponse(DamageReport damage) {
        return DamageResponse.builder()
                .damageId(damage.getDamageId())
                .unitId(damage.getUnit().getUnitId())
                .unitNumber(damage.getUnit().getUnitNumber())
                .tenantName(damage.getUser().getName())
                .tenantEmail(damage.getUser().getEmail())
                .userId(damage.getUser().getUserId())
                .description(damage.getDescription())
                .beforeImage(damage.getBeforeImage())
                .afterImage(damage.getAfterImage())
                .estimatedCost(damage.getEstimatedCost())
                .status(damage.getStatus())
                .billed(damage.getBilled())
                .createdAt(damage.getCreatedAt())
                .updatedAt(damage.getUpdatedAt())
                .build();
    }
}
