package com.RenterzPaizza.RenterzPaizza.mapper;

import com.RenterzPaizza.RenterzPaizza.dto.PaymentResponse;
import com.RenterzPaizza.RenterzPaizza.entity.Payment;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Component;

@Component
public class PaymentMapper {
    public PaymentResponse toResponse(Payment payment) {
        String unitNumber = null;
        Long rentId = null;
        Long maintenanceId = null;
        Long damageId = null;

        try {
            // Try to get rent info - may throw EntityNotFoundException if referenced rent
            // doesn't exist
            if (payment.getRent() != null) {
                rentId = payment.getRent().getRentId();
                try {
                    if (payment.getRent().getAllocation() != null
                            && payment.getRent().getAllocation().getUnit() != null) {
                        unitNumber = payment.getRent().getAllocation().getUnit().getUnitNumber();
                    }
                } catch (EntityNotFoundException e) {
                    // Rent exists but allocation/unit may be missing
                }
            }
        } catch (EntityNotFoundException e) {
            // Rent reference is invalid - rent_id points to non-existent record
            rentId = null;
        }

        try {
            if (payment.getMaintenance() != null) {
                maintenanceId = payment.getMaintenance().getMaintenanceId();
                try {
                    if (payment.getMaintenance().getUnit() != null) {
                        unitNumber = payment.getMaintenance().getUnit().getUnitNumber();
                    }
                } catch (EntityNotFoundException e) {
                    // Maintenance exists but unit may be missing
                }
            }
        } catch (EntityNotFoundException e) {
            maintenanceId = null;
        }

        try {
            if (payment.getDamageReport() != null) {
                damageId = payment.getDamageReport().getDamageId();
                try {
                    if (payment.getDamageReport().getUnit() != null) {
                        unitNumber = payment.getDamageReport().getUnit().getUnitNumber();
                    }
                } catch (EntityNotFoundException e) {
                    // DamageReport exists but unit may be missing
                }
            }
        } catch (EntityNotFoundException e) {
            damageId = null;
        }

        return PaymentResponse.builder()
                .paymentId(payment.getPaymentId())
                .userId(payment.getUser() != null ? payment.getUser().getUserId() : null)
                .tenantName(payment.getUser() != null ? payment.getUser().getName() : null)
                .unitNumber(unitNumber)
                .rentId(rentId)
                .maintenanceId(maintenanceId)
                .damageId(damageId)
                .amount(payment.getAmount())
                .paymentMode(payment.getPaymentMode())
                .status(payment.getStatus())
                .paymentDate(payment.getPaymentDate())
                .build();
    }
}
