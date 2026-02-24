package com.RenterzPaizza.RenterzPaizza.controller;

import com.RenterzPaizza.RenterzPaizza.common.ApiResponse;
import com.RenterzPaizza.RenterzPaizza.common.PageMapper;
import com.RenterzPaizza.RenterzPaizza.common.PageResponse;
import com.RenterzPaizza.RenterzPaizza.dto.UnitAllocationRequest;
import com.RenterzPaizza.RenterzPaizza.dto.UnitAllocationResponse;
import com.RenterzPaizza.RenterzPaizza.service.UnitAllocationService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
public class UnitAllocationController {

    private final UnitAllocationService allocationService;

    public UnitAllocationController(UnitAllocationService allocationService) {
        this.allocationService = allocationService;
    }

    @PostMapping("/api/owner/allocations")
    public ApiResponse<UnitAllocationResponse> allocate(@Valid @RequestBody UnitAllocationRequest request) {
        return ApiResponse.ok("Allocation created", allocationService.create(request));
    }

    @GetMapping("/api/owner/allocations")
    public ApiResponse<PageResponse<UnitAllocationResponse>> ownerAllocations(Pageable pageable) {
        Page<UnitAllocationResponse> page = allocationService.listForOwner(pageable);
        return ApiResponse.ok("Allocations fetched", PageMapper.toPageResponse(page));
    }

    @PutMapping("/api/owner/allocations/{allocationId}/terminate")
    public ApiResponse<UnitAllocationResponse> terminate(@PathVariable Long allocationId) {
        return ApiResponse.ok("Allocation terminated", allocationService.terminate(allocationId));
    }

    @GetMapping("/api/tenant/allocations")
    public ApiResponse<PageResponse<UnitAllocationResponse>> tenantAllocations(Pageable pageable) {
        Page<UnitAllocationResponse> page = allocationService.listForTenant(pageable);
        return ApiResponse.ok("Allocations fetched", PageMapper.toPageResponse(page));
    }
}
