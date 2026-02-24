package com.RenterzPaizza.RenterzPaizza.mapper;

import com.RenterzPaizza.RenterzPaizza.dto.MaintenanceResponse;
import com.RenterzPaizza.RenterzPaizza.entity.Maintenance;
import org.springframework.stereotype.Component;

@Component
public class MaintenanceMapper {
    public MaintenanceResponse toResponse(Maintenance maintenance) {
        return MaintenanceResponse.builder()
                .maintenanceId(maintenance.getMaintenanceId())
                .unitId(maintenance.getUnit().getUnitId())
                .unitNumber(maintenance.getUnit().getUnitNumber())
                .title(maintenance.getTitle())
                .amount(maintenance.getAmount())
                .dueDate(maintenance.getDueDate())
                .status(maintenance.getStatus())
                .createdAt(maintenance.getCreatedAt())
                .updatedAt(maintenance.getUpdatedAt())
                .build();
    }
}
