package com.RenterzPaizza.RenterzPaizza.controller;

import com.RenterzPaizza.RenterzPaizza.common.ApiResponse;
import com.RenterzPaizza.RenterzPaizza.common.PageMapper;
import com.RenterzPaizza.RenterzPaizza.common.PageResponse;
import com.RenterzPaizza.RenterzPaizza.dto.PaymentGatewayInitRequest;
import com.RenterzPaizza.RenterzPaizza.dto.PaymentGatewayInitResponse;
import com.RenterzPaizza.RenterzPaizza.dto.PaymentRequest;
import com.RenterzPaizza.RenterzPaizza.dto.PaymentResponse;
import com.RenterzPaizza.RenterzPaizza.service.PaymentGatewayService;
import com.RenterzPaizza.RenterzPaizza.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
public class PaymentController {

    private final PaymentService paymentService;
    private final PaymentGatewayService paymentGatewayService;

    public PaymentController(PaymentService paymentService,
                             PaymentGatewayService paymentGatewayService) {
        this.paymentService = paymentService;
        this.paymentGatewayService = paymentGatewayService;
    }

    @PostMapping("/api/tenant/payments")
    public ApiResponse<PaymentResponse> pay(@Valid @RequestBody PaymentRequest request) {
        return ApiResponse.ok("Payment successful", paymentService.pay(request));
    }

    @GetMapping("/api/common/payments")
    public ApiResponse<PageResponse<PaymentResponse>> myPayments(Pageable pageable) {
        Page<PaymentResponse> page = paymentService.myPayments(pageable);
        return ApiResponse.ok("Payments fetched", PageMapper.toPageResponse(page));
    }

    @PostMapping("/api/common/payments/gateway/init")
    public ApiResponse<PaymentGatewayInitResponse> initGateway(@Valid @RequestBody PaymentGatewayInitRequest request) {
        return ApiResponse.ok("Payment gateway initialized", paymentGatewayService.initializeCheckout(request));
    }
}
