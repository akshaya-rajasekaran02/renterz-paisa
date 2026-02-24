package com.RenterzPaizza.RenterzPaizza.dto;

import com.RenterzPaizza.RenterzPaizza.entity.enums.BillingStatus;
import com.RenterzPaizza.RenterzPaizza.entity.enums.PaymentMode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class PaymentResponse {
    private Long paymentId;
    private Long userId;
    private String tenantName;
    private String unitNumber;
    private Long rentId;
    private Long maintenanceId;
    private Long damageId;
    private BigDecimal amount;
    private PaymentMode paymentMode;
    private BillingStatus status;
    private LocalDateTime paymentDate;
}
