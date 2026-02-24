package com.RenterzPaizza.RenterzPaizza.controller;

import com.RenterzPaizza.RenterzPaizza.common.ApiResponse;
import com.RenterzPaizza.RenterzPaizza.common.PageMapper;
import com.RenterzPaizza.RenterzPaizza.common.PageResponse;
import com.RenterzPaizza.RenterzPaizza.dto.DamageRequest;
import com.RenterzPaizza.RenterzPaizza.dto.DamageResponse;
import com.RenterzPaizza.RenterzPaizza.service.DamageService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
public class DamageController {

    private final DamageService damageService;

    public DamageController(DamageService damageService) {
        this.damageService = damageService;
    }

    @PostMapping("/api/owner/damages")
    public ApiResponse<DamageResponse> create(@Valid @RequestBody DamageRequest request) {
        return ApiResponse.ok("Damage bill created", damageService.createDamageBill(request));
    }

    @GetMapping("/api/owner/damages")
    public ApiResponse<PageResponse<DamageResponse>> ownerList(Pageable pageable) {
        Page<DamageResponse> page = damageService.listForOwner(pageable);
        return ApiResponse.ok("Damage records fetched", PageMapper.toPageResponse(page));
    }

    @GetMapping("/api/tenant/damages")
    public ApiResponse<PageResponse<DamageResponse>> tenantList(Pageable pageable) {
        Page<DamageResponse> page = damageService.listForTenant(pageable);
        return ApiResponse.ok("Damage records fetched", PageMapper.toPageResponse(page));
    }
}
