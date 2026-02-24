package com.RenterzPaizza.RenterzPaizza.controller;

import com.RenterzPaizza.RenterzPaizza.service.CommunicationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TwilioWebhookController {

    private final CommunicationService communicationService;

    public TwilioWebhookController(CommunicationService communicationService) {
        this.communicationService = communicationService;
    }

    @PostMapping("/webhooks/twilio/sms-status/{communicationId}")
    public ResponseEntity<Void> smsStatusCallback(@PathVariable Long communicationId,
                                                  @RequestParam(value = "MessageStatus", required = false) String messageStatus) {
        communicationService.applySmsCallback(communicationId, messageStatus);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/webhooks/twilio/voice-status/{communicationId}")
    public ResponseEntity<Void> voiceStatusCallback(@PathVariable Long communicationId,
                                                    @RequestParam(value = "CallStatus", required = false) String callStatus) {
        communicationService.applyVoiceCallback(communicationId, callStatus);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/webhooks/twilio/whatsapp-status/{communicationId}")
    public ResponseEntity<Void> whatsappStatusCallback(@PathVariable Long communicationId,
                                                       @RequestParam(value = "MessageStatus", required = false) String messageStatus) {
        communicationService.applyWhatsAppCallback(communicationId, messageStatus);
        return ResponseEntity.ok().build();
    }
}
