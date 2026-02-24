package com.RenterzPaizza.RenterzPaizza.dto;

import com.RenterzPaizza.RenterzPaizza.entity.enums.BillingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class MaintenanceResponse {
    private Long maintenanceId;
    private Long unitId;
    private String unitNumber;
    private String title;
    private BigDecimal amount;
    private LocalDate dueDate;
    private BillingStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
