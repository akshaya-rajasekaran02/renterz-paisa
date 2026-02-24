package com.RenterzPaizza.RenterzPaizza.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.rest.api.v2010.account.MessageCreator;
import com.twilio.type.PhoneNumber;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;

@Service
public class WhatsAppSender {

    private static final Logger log = LoggerFactory.getLogger(WhatsAppSender.class);

    @Value("${twilio.account.sid:}")
    private String accountSid;

    @Value("${twilio.auth.token:}")
    private String authToken;

    @Value("${twilio.phone.number:}")
    private String defaultFromNumber;

    @Value("${twilio.whatsapp.number:}")
    private String whatsappFromNumber;

    @Value("${twilio.enabled:false}")
    private boolean twilioEnabled;

    @Value("${twilio.dry-run:true}")
    private boolean twilioDryRun;

    @Value("${app.public.base-url:}")
    private String baseUrl;

    /**
     * Sends WhatsApp via Twilio when enabled; dry-run mode does not send real messages.
     */
    public boolean send(Long communicationId, String mobile, String message) {
        if (!twilioEnabled) {
            log.info("WhatsApp skipped: Twilio is disabled by configuration");
            return true;
        }
        if (twilioDryRun) {
            log.info("WhatsApp dry-run enabled. No outbound message sent for mobile={}", mobile);
            return true;
        }

        if (!isConfigured()) {
            log.warn("WhatsApp skipped: Twilio configuration is missing");
            return false;
        }

        String toNumber = normalizePhone(mobile);
        if (toNumber == null) {
            log.warn("WhatsApp skipped: invalid destination mobile={}", mobile);
            return false;
        }

        String fromNumber = resolveFromNumber();
        if (isBlank(fromNumber)) {
            log.warn("WhatsApp skipped: from number is missing");
            return false;
        }

        try {
            Twilio.init(accountSid, authToken);
            MessageCreator creator = Message.creator(
                    new PhoneNumber("whatsapp:" + toNumber),
                    new PhoneNumber("whatsapp:" + fromNumber),
                    message
            );
            URI callbackUri = buildStatusCallbackUrl(communicationId);
            if (callbackUri != null) {
                creator.setStatusCallback(callbackUri);
            }
            creator.create();
            log.info("WhatsApp sent to {}", toNumber);
            return true;
        } catch (Exception e) {
            log.error("WhatsApp send failed for {}", toNumber, e);
            return false;
        }
    }

    private String resolveFromNumber() {
        if (!isBlank(whatsappFromNumber)) {
            return normalizePhone(whatsappFromNumber);
        }
        return normalizePhone(defaultFromNumber);
    }

    private boolean isConfigured() {
        return !isBlank(accountSid) && !isBlank(authToken) && !isBlank(defaultFromNumber);
    }

    private String normalizePhone(String mobile) {
        if (isBlank(mobile)) {
            return null;
        }

        String normalized = mobile.trim();
        if (normalized.startsWith("+")) {
            normalized = "+" + normalized.substring(1).replaceAll("\\D", "");
        } else {
            normalized = "+" + normalized.replaceAll("\\D", "");
        }

        return normalized.length() >= 11 && normalized.length() <= 16 ? normalized : null;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private URI buildStatusCallbackUrl(Long communicationId) {
        if (communicationId == null || isBlank(baseUrl)) {
            return null;
        }
        String normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        return URI.create(normalizedBaseUrl + "/webhooks/twilio/whatsapp-status/" + communicationId);
    }
}
