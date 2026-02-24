package com.RenterzPaizza.RenterzPaizza.dto;

import com.RenterzPaizza.RenterzPaizza.entity.enums.DamageStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class DamageResponse {
    private Long damageId;
    private Long unitId;
    private String unitNumber;
    private String tenantName;
    private String tenantEmail;
    private Long userId;
    private String description;
    private String beforeImage;
    private String afterImage;
    private BigDecimal estimatedCost;
    private DamageStatus status;
    private Boolean billed;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
