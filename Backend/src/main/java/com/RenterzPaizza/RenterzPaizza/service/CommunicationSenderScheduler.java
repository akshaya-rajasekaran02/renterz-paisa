package com.RenterzPaizza.RenterzPaizza.service;

import com.RenterzPaizza.RenterzPaizza.entity.Communication;
import com.RenterzPaizza.RenterzPaizza.entity.User;
import com.RenterzPaizza.RenterzPaizza.entity.enums.CommunicationStatus;
import com.RenterzPaizza.RenterzPaizza.repository.CommunicationRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommunicationSenderScheduler {

    private final CommunicationRepository communicationRepository;
    private final SmsSender smsSender;
    private final WhatsAppSender whatsAppSender;
    private final VoiceSender voiceSender;
    private final EmailSender emailSender;

    public CommunicationSenderScheduler(CommunicationRepository communicationRepository,
                                        SmsSender smsSender,
                                        WhatsAppSender whatsAppSender,
                                        VoiceSender voiceSender,
                                        EmailSender emailSender) {
        this.communicationRepository = communicationRepository;
        this.smsSender = smsSender;
        this.whatsAppSender = whatsAppSender;
        this.voiceSender = voiceSender;
        this.emailSender = emailSender;
    }

    @Scheduled(fixedRate = 60000)
    public void processPendingCommunications() {
        List<Communication> pending = communicationRepository.findByStatusAndDeletedFalse(CommunicationStatus.PENDING);

        for (Communication communication : pending) {
            boolean success = false;
            User user = communication.getUser();

            switch (communication.getChannel()) {
                case SMS -> success = smsSender.send(communication.getCommunicationId(), user.getMobile(), communication.getMessage());
                case WHATSAPP -> success = whatsAppSender.send(communication.getCommunicationId(), user.getMobile(), communication.getMessage());
                case VOICE -> success = voiceSender.send(communication.getCommunicationId(), user.getMobile(), communication.getMessage());
                case EMAIL -> success = emailSender.send(user.getEmail(), communication.getMessage());
                default -> success = false;
            }

            communication.setStatus(success ? CommunicationStatus.SENT : CommunicationStatus.FAILED);
            communicationRepository.save(communication);
        }
    }
}
