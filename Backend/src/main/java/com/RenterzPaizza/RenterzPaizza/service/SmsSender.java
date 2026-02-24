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
public class SmsSender {

    private static final Logger log = LoggerFactory.getLogger(SmsSender.class);

    @Value("${twilio.account.sid:}")
    private String accountSid;

    @Value("${twilio.auth.token:}")
    private String authToken;

    @Value("${twilio.phone.number:}")
    private String fromNumber;

    @Value("${twilio.enabled:false}")
    private boolean twilioEnabled;

    @Value("${twilio.dry-run:true}")
    private boolean twilioDryRun;

    @Value("${app.public.base-url:}")
    private String baseUrl;

    /**
     * Sends SMS via Twilio when enabled; in dry-run mode it only logs and marks as successful.
     */
    public boolean send(Long communicationId, String mobile, String message) {
        if (!twilioEnabled) {
            log.info("SMS skipped: Twilio is disabled by configuration");
            return true;
        }
        if (twilioDryRun) {
            log.info("SMS dry-run enabled. No outbound message sent for mobile={}", mobile);
            return true;
        }

        if (!isConfigured()) {
            log.warn("SMS skipped: Twilio configuration is missing");
            return false;
        }

        String toNumber = normalizePhone(mobile);
        if (toNumber == null) {
            log.warn("SMS skipped: invalid destination mobile={}", mobile);
            return false;
        }

        try {
            Twilio.init(accountSid, authToken);
            MessageCreator creator = Message.creator(new PhoneNumber(toNumber), new PhoneNumber(fromNumber), message);
            URI callbackUri = buildStatusCallbackUrl(communicationId);
            if (callbackUri != null) {
                creator.setStatusCallback(callbackUri);
            }
            creator.create();
            log.info("SMS sent to {}", toNumber);
            return true;
        } catch (Exception e) {
            log.error("SMS send failed for {}", toNumber, e);
            return false;
        }
    }

    private boolean isConfigured() {
        return !isBlank(accountSid) && !isBlank(authToken) && !isBlank(fromNumber);
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
        return URI.create(normalizedBaseUrl + "/webhooks/twilio/sms-status/" + communicationId);
    }
}
