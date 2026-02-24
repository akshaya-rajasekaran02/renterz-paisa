package com.RenterzPaizza.RenterzPaizza.controller;

import com.RenterzPaizza.RenterzPaizza.common.ApiResponse;
import com.RenterzPaizza.RenterzPaizza.common.PageMapper;
import com.RenterzPaizza.RenterzPaizza.common.PageResponse;
import com.RenterzPaizza.RenterzPaizza.dto.RentResponse;
import com.RenterzPaizza.RenterzPaizza.service.RentService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class RentController {

    private final RentService rentService;

    public RentController(RentService rentService) {
        this.rentService = rentService;
    }

    @GetMapping("/api/tenant/rents")
    public ApiResponse<PageResponse<RentResponse>> tenantRents(Pageable pageable) {
        Page<RentResponse> page = rentService.listForTenant(pageable);
        return ApiResponse.ok("Rents fetched", PageMapper.toPageResponse(page));
    }

    @GetMapping("/api/owner/rents")
    public ApiResponse<PageResponse<RentResponse>> ownerRents(Pageable pageable) {
        Page<RentResponse> page = rentService.listForOwner(pageable);
        return ApiResponse.ok("Rents fetched", PageMapper.toPageResponse(page));
    }

    @PostMapping("/api/admin/rents/generate")
    public ApiResponse<List<RentResponse>> generateMonthly() {
        return ApiResponse.ok("Rent generation executed", rentService.generateMonthlyRent());
    }
}
