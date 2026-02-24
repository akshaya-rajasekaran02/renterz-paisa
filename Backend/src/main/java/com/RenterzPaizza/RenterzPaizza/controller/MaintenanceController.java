package com.RenterzPaizza.RenterzPaizza.controller;

import com.RenterzPaizza.RenterzPaizza.common.ApiResponse;
import com.RenterzPaizza.RenterzPaizza.common.PageMapper;
import com.RenterzPaizza.RenterzPaizza.common.PageResponse;
import com.RenterzPaizza.RenterzPaizza.dto.MaintenanceRequest;
import com.RenterzPaizza.RenterzPaizza.dto.MaintenanceResponse;
import com.RenterzPaizza.RenterzPaizza.service.MaintenanceService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/owner/maintenance")
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    public MaintenanceController(MaintenanceService maintenanceService) {
        this.maintenanceService = maintenanceService;
    }

    @PostMapping
    public ApiResponse<MaintenanceResponse> create(@Valid @RequestBody MaintenanceRequest request) {
        return ApiResponse.ok("Maintenance bill created", maintenanceService.create(request));
    }

    @GetMapping
    public ApiResponse<PageResponse<MaintenanceResponse>> list(Pageable pageable) {
        Page<MaintenanceResponse> page = maintenanceService.listForOwner(pageable);
        return ApiResponse.ok("Maintenance bills fetched", PageMapper.toPageResponse(page));
    }
}
