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
public class RentResponse {
    private Long rentId;
    private Long allocationId;
    private Long tenantId;
    private String tenantName;
    private String tenantEmail;
    private Long unitId;
    private String unitNumber;
    private BigDecimal amount;
    private LocalDate dueDate;
    private BillingStatus status;
    private String billingMonth;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
