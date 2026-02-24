package com.RenterzPaizza.RenterzPaizza.service;

import com.RenterzPaizza.RenterzPaizza.dto.PaymentGatewayInitRequest;
import com.RenterzPaizza.RenterzPaizza.dto.PaymentGatewayInitResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class PaymentGatewayService {

    @Value("${payment.gateway.provider:RAZORPAY}")
    private String provider;

    @Value("${payment.gateway.enabled:false}")
    private boolean gatewayEnabled;

    @Value("${payment.gateway.dry-run:true}")
    private boolean dryRun;

    @Value("${payment.gateway.public-key:}")
    private String publicKey;

    /**
     * Initializes a checkout session in safe mode.
     * This does not trigger a real payment when gateway is disabled or dry-run is true.
     */
    public PaymentGatewayInitResponse initializeCheckout(PaymentGatewayInitRequest request) {
        String orderId = "PG_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        String checkoutUrl = resolveCheckoutUrl(orderId, request.getSuccessUrl(), request.getCancelUrl());
        String statusMessage = (!gatewayEnabled || dryRun)
                ? "Gateway initialized in non-live mode. No real payment will be processed."
                : "Gateway initialized in live mode.";

        return PaymentGatewayInitResponse.builder()
                .provider(provider)
                .gatewayEnabled(gatewayEnabled)
                .dryRun(dryRun)
                .gatewayOrderId(orderId)
                .checkoutUrl(checkoutUrl)
                .publicKey(publicKey)
                .message(statusMessage)
                .build();
    }

    /**
     * Builds a safe fallback checkout URL when provider SDK integration is not enabled.
     */
    private String resolveCheckoutUrl(String orderId, String successUrl, String cancelUrl) {
        if (successUrl != null && !successUrl.isBlank()) {
            String separator = successUrl.contains("?") ? "&" : "?";
            return successUrl + separator + "gatewayOrderId=" + orderId + "&gatewayMode=simulated";
        }
        if (cancelUrl != null && !cancelUrl.isBlank()) {
            String separator = cancelUrl.contains("?") ? "&" : "?";
            return cancelUrl + separator + "gatewayOrderId=" + orderId + "&gatewayMode=simulated";
        }
        return "";
    }
}
