package com.RenterzPaizza.RenterzPaizza.service;

import com.RenterzPaizza.RenterzPaizza.dto.PaymentRequest;
import com.RenterzPaizza.RenterzPaizza.dto.PaymentResponse;
import com.RenterzPaizza.RenterzPaizza.entity.*;
import com.RenterzPaizza.RenterzPaizza.entity.enums.BillingStatus;
import com.RenterzPaizza.RenterzPaizza.exception.BadRequestException;
import com.RenterzPaizza.RenterzPaizza.exception.ForbiddenException;
import com.RenterzPaizza.RenterzPaizza.exception.NotFoundException;
import com.RenterzPaizza.RenterzPaizza.mapper.PaymentMapper;
import com.RenterzPaizza.RenterzPaizza.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final CurrentUserService currentUserService;
    private final PaymentMapper paymentMapper;
    private final RentRepository rentRepository;
    private final MaintenanceRepository maintenanceRepository;
    private final DamageRepository damageRepository;
    private final CommunicationService communicationService;

    public PaymentService(PaymentRepository paymentRepository,
                          CurrentUserService currentUserService,
                          PaymentMapper paymentMapper,
                          RentRepository rentRepository,
                          MaintenanceRepository maintenanceRepository,
                          DamageRepository damageRepository,
                          CommunicationService communicationService) {
        this.paymentRepository = paymentRepository;
        this.currentUserService = currentUserService;
        this.paymentMapper = paymentMapper;
        this.rentRepository = rentRepository;
        this.maintenanceRepository = maintenanceRepository;
        this.damageRepository = damageRepository;
        this.communicationService = communicationService;
    }

    @Transactional
    public PaymentResponse pay(PaymentRequest request) {
        User payer = currentUserService.getCurrentUser();
        int links = (request.getRentId() != null ? 1 : 0)
                + (request.getMaintenanceId() != null ? 1 : 0)
                + (request.getDamageId() != null ? 1 : 0);

        if (links != 1) {
            throw new BadRequestException("Exactly one of rentId, maintenanceId, damageId is required");
        }

        Rent rent = null;
        Maintenance maintenance = null;
        DamageReport damage = null;

        if (request.getRentId() != null) {
            rent = rentRepository.findById(request.getRentId())
                    .orElseThrow(() -> new NotFoundException("Rent bill not found"));
            if (!rent.getAllocation().getTenant().getUserId().equals(payer.getUserId())) {
                throw new ForbiddenException("Tenant can only pay own rent");
            }
            ensureAmountMatches(request.getAmount(), rent.getAmount(), "rent");
            rent.setStatus(BillingStatus.PAID);
            rentRepository.save(rent);
        }

        if (request.getMaintenanceId() != null) {
            maintenance = maintenanceRepository.findById(request.getMaintenanceId())
                    .orElseThrow(() -> new NotFoundException("Maintenance bill not found"));
            ensureAmountMatches(request.getAmount(), maintenance.getAmount(), "maintenance");
            maintenance.setStatus(BillingStatus.PAID);
            maintenanceRepository.save(maintenance);
        }

        if (request.getDamageId() != null) {
            damage = damageRepository.findById(request.getDamageId())
                    .orElseThrow(() -> new NotFoundException("Damage bill not found"));
            if (!damage.getUser().getUserId().equals(payer.getUserId())) {
                throw new ForbiddenException("Tenant can only pay own damage bill");
            }
            ensureAmountMatches(request.getAmount(), damage.getEstimatedCost(), "damage");
            damage.setStatus(com.RenterzPaizza.RenterzPaizza.entity.enums.DamageStatus.PAID);
            damageRepository.save(damage);
        }

        Payment payment = Payment.builder()
                .user(payer)
                .rent(rent)
                .maintenance(maintenance)
                .damageReport(damage)
                .amount(request.getAmount())
                .paymentMode(request.getPaymentMode())
                .status(BillingStatus.PAID)
                .paymentDate(LocalDateTime.now())
                .build();

        Payment saved = paymentRepository.save(payment);
        communicationService.enqueuePaymentSuccess(payer, saved);
        return paymentMapper.toResponse(saved);
    }

    public Page<PaymentResponse> myPayments(Pageable pageable) {
        User user = currentUserService.getCurrentUser();
        return paymentRepository.findByUserUserIdAndDeletedFalse(user.getUserId(), pageable)
                .map(paymentMapper::toResponse);
    }

    private void ensureAmountMatches(BigDecimal input, BigDecimal expected, String type) {
        if (input.compareTo(expected) != 0) {
            throw new BadRequestException("Invalid " + type + " amount");
        }
    }
}
