package com.RenterzPaizza.RenterzPaizza.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class PaymentGatewayInitResponse {
    private String provider;
    private boolean gatewayEnabled;
    private boolean dryRun;
    private String gatewayOrderId;
    private String checkoutUrl;
    private String publicKey;
    private String message;
}

