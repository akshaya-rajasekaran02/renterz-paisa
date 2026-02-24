package com.RenterzPaizza.RenterzPaizza.service;

import com.RenterzPaizza.RenterzPaizza.dto.CommunicationResponse;
import com.RenterzPaizza.RenterzPaizza.entity.*;
import com.RenterzPaizza.RenterzPaizza.entity.enums.CommunicationChannel;
import com.RenterzPaizza.RenterzPaizza.entity.enums.CommunicationStatus;
import com.RenterzPaizza.RenterzPaizza.mapper.CommunicationMapper;
import com.RenterzPaizza.RenterzPaizza.repository.CommunicationRepository;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
public class CommunicationService {

    private final CommunicationRepository communicationRepository;
    private final CommunicationRouter communicationRouter;
    private final CommunicationMapper communicationMapper;
    private final CurrentUserService currentUserService;

    public CommunicationService(CommunicationRepository communicationRepository,
                                CommunicationRouter communicationRouter,
                                CommunicationMapper communicationMapper,
                                CurrentUserService currentUserService) {
        this.communicationRepository = communicationRepository;
        this.communicationRouter = communicationRouter;
        this.communicationMapper = communicationMapper;
        this.currentUserService = currentUserService;
    }

    @Transactional
    public void enqueueRentGenerated(User user, Rent rent) {
        createForAllChannels(user, "RENT_GENERATED", "Rent " + rent.getAmount() + " generated. Due on " + rent.getDueDate());
    }

    @Transactional
    public void enqueueOverdue(User user, Rent rent) {
        createForAllChannels(user, "RENT_OVERDUE", "Rent " + rent.getAmount() + " is overdue for " + rent.getBillingMonth());
    }

    @Transactional
    public void enqueuePaymentSuccess(User user, Payment payment) {
        createForAllChannels(user, "PAYMENT_SUCCESS", "Payment " + payment.getAmount() + " received successfully.");
    }

    @Transactional
    public void enqueueMaintenanceBilling(User user, Maintenance maintenance) {
        createForAllChannels(user, "MAINTENANCE_BILLING", "Maintenance bill " + maintenance.getAmount() + " due on " + maintenance.getDueDate());
    }

    @Transactional
    public void enqueueDamageBilling(User user, DamageReport damage) {
        createForAllChannels(user, "DAMAGE_BILLING", "Damage bill " + damage.getEstimatedCost() + " has been raised.");
    }

    public Page<CommunicationResponse> myCommunications(Pageable pageable) {
        User current = currentUserService.getCurrentUser();
        return communicationRepository.findByUserUserIdAndDeletedFalse(current.getUserId(), pageable)
                .map(communicationMapper::toResponse);
    }

    @Transactional
    public void applySmsCallback(Long communicationId, String smsStatus) {
        updateFromProviderStatus(communicationId, CommunicationChannel.SMS, smsStatus);
    }

    @Transactional
    public void applyVoiceCallback(Long communicationId, String callStatus) {
        updateFromProviderStatus(communicationId, CommunicationChannel.VOICE, callStatus);
    }

    @Transactional
    public void applyWhatsAppCallback(Long communicationId, String messageStatus) {
        updateFromProviderStatus(communicationId, CommunicationChannel.WHATSAPP, messageStatus);
    }

    private void createForAllChannels(User user, String template, String message) {
        List<CommunicationChannel> channels = communicationRouter.resolveChannels(user);
        for (CommunicationChannel channel : channels) {
            Communication communication = Communication.builder()
                    .user(user)
                    .channel(channel)
                    .templateName(template)
                    .message(message)
                    .status(CommunicationStatus.PENDING)
                    .build();
            communicationRepository.save(communication);
        }
    }

    private void updateFromProviderStatus(Long communicationId, CommunicationChannel expectedChannel, String providerStatus) {
        Communication communication = communicationRepository.findByCommunicationIdAndDeletedFalse(communicationId).orElse(null);
        if (communication == null || communication.getChannel() != expectedChannel) {
            return;
        }

        CommunicationStatus mappedStatus = mapProviderStatus(providerStatus);
        if (mappedStatus != null) {
            communication.setStatus(mappedStatus);
            communicationRepository.save(communication);
        }
    }

    private CommunicationStatus mapProviderStatus(String providerStatus) {
        if (providerStatus == null || providerStatus.isBlank()) {
            return null;
        }

        String status = providerStatus.trim().toLowerCase();
        Set<String> successStates = Set.of(
                "sent", "delivered", "accepted", "read",
                "queued", "initiated", "ringing", "in-progress", "answered", "completed"
        );
        Set<String> failureStates = Set.of(
                "failed", "undelivered", "canceled", "busy", "no-answer"
        );

        if (successStates.contains(status)) {
            return CommunicationStatus.SENT;
        }
        if (failureStates.contains(status)) {
            return CommunicationStatus.FAILED;
        }
        return null;
    }
}
