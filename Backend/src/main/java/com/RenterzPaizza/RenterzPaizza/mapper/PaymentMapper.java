package com.RenterzPaizza.RenterzPaizza.mapper;

import com.RenterzPaizza.RenterzPaizza.dto.PaymentResponse;
import com.RenterzPaizza.RenterzPaizza.entity.Payment;
import org.springframework.stereotype.Component;

@Component
public class PaymentMapper {
    public PaymentResponse toResponse(Payment payment) {
        String unitNumber = null;
        if (payment.getRent() != null) {
            unitNumber = payment.getRent().getAllocation().getUnit().getUnitNumber();
        } else if (payment.getMaintenance() != null) {
            unitNumber = payment.getMaintenance().getUnit().getUnitNumber();
        } else if (payment.getDamageReport() != null) {
            unitNumber = payment.getDamageReport().getUnit().getUnitNumber();
        }

        return PaymentResponse.builder()
                .paymentId(payment.getPaymentId())
                .userId(payment.getUser().getUserId())
                .tenantName(payment.getUser().getName())
                .unitNumber(unitNumber)
                .rentId(payment.getRent() != null ? payment.getRent().getRentId() : null)
                .maintenanceId(payment.getMaintenance() != null ? payment.getMaintenance().getMaintenanceId() : null)
                .damageId(payment.getDamageReport() != null ? payment.getDamageReport().getDamageId() : null)
                .amount(payment.getAmount())
                .paymentMode(payment.getPaymentMode())
                .status(payment.getStatus())
                .paymentDate(payment.getPaymentDate())
                .build();
    }
}
