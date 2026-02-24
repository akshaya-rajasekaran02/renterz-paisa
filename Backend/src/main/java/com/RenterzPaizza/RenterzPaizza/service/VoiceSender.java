package com.RenterzPaizza.RenterzPaizza.service;

import com.twilio.Twilio;
import com.twilio.http.HttpMethod;
import com.twilio.rest.api.v2010.account.Call;
import com.twilio.rest.api.v2010.account.CallCreator;
import com.twilio.type.PhoneNumber;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Service
public class VoiceSender {

    private static final Logger log = LoggerFactory.getLogger(VoiceSender.class);

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
     * Triggers voice call via Twilio when enabled; dry-run mode avoids placing actual calls.
     */
    public boolean send(Long communicationId, String mobile, String message) {
        if (!twilioEnabled) {
            log.info("Voice call skipped: Twilio is disabled by configuration");
            return true;
        }
        if (twilioDryRun) {
            log.info("Voice dry-run enabled. No outbound call triggered for mobile={}", mobile);
            return true;
        }

        if (!isConfigured()) {
            log.warn("Voice call skipped: Twilio configuration is missing");
            return false;
        }

        String toNumber = normalizePhone(mobile);
        if (toNumber == null) {
            log.warn("Voice call skipped: invalid destination mobile={}", mobile);
            return false;
        }

        try {
            Twilio.init(accountSid, authToken);
            String twimlUrl = buildTwimlUrl(message);
            CallCreator creator = Call.creator(new PhoneNumber(toNumber), new PhoneNumber(fromNumber), URI.create(twimlUrl));
            URI callbackUri = buildStatusCallbackUrl(communicationId);
            if (callbackUri != null) {
                creator.setStatusCallback(callbackUri);
                creator.setStatusCallbackMethod(HttpMethod.POST);
                creator.setStatusCallbackEvent(List.of("initiated", "ringing", "answered", "completed"));
            }
            creator.create();
            log.info("Voice call triggered to {}", toNumber);
            return true;
        } catch (Exception e) {
            log.error("Voice call failed for {}", toNumber, e);
            return false;
        }
    }

    private String buildTwimlUrl(String message) {
        String safeMessage = escapeXml(message == null ? "Notification from Renterz Paizza." : message);
        String twiml = "<Response><Say voice=\"alice\">" + safeMessage + "</Say></Response>";
        return "https://twimlets.com/echo?Twiml=" + URLEncoder.encode(twiml, StandardCharsets.UTF_8);
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

    private String escapeXml(String value) {
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&apos;");
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private URI buildStatusCallbackUrl(Long communicationId) {
        if (communicationId == null || isBlank(baseUrl)) {
            return null;
        }
        String normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        return URI.create(normalizedBaseUrl + "/webhooks/twilio/voice-status/" + communicationId);
    }
}
