package com.RenterzPaizza.RenterzPaizza.controller;

import com.RenterzPaizza.RenterzPaizza.common.ApiResponse;
import com.RenterzPaizza.RenterzPaizza.common.PageMapper;
import com.RenterzPaizza.RenterzPaizza.common.PageResponse;
import com.RenterzPaizza.RenterzPaizza.dto.ComplaintRequest;
import com.RenterzPaizza.RenterzPaizza.dto.ComplaintResponse;
import com.RenterzPaizza.RenterzPaizza.entity.enums.WorkFlowStatus;
import com.RenterzPaizza.RenterzPaizza.service.ComplaintService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
public class ComplaintController {

    private final ComplaintService complaintService;

    public ComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    @PostMapping("/api/tenant/complaints")
    public ApiResponse<ComplaintResponse> create(@Valid @RequestBody ComplaintRequest request) {
        return ApiResponse.ok("Complaint created", complaintService.create(request));
    }

    @GetMapping("/api/tenant/complaints")
    public ApiResponse<PageResponse<ComplaintResponse>> tenantList(Pageable pageable) {
        Page<ComplaintResponse> page = complaintService.listForTenant(pageable);
        return ApiResponse.ok("Complaints fetched", PageMapper.toPageResponse(page));
    }

    @GetMapping("/api/owner/complaints")
    public ApiResponse<PageResponse<ComplaintResponse>> ownerList(Pageable pageable) {
        Page<ComplaintResponse> page = complaintService.listForOwner(pageable);
        return ApiResponse.ok("Complaints fetched", PageMapper.toPageResponse(page));
    }

    @PutMapping("/api/owner/complaints/{id}/status")
    public ApiResponse<ComplaintResponse> updateStatus(@PathVariable Long id,
                                                       @RequestParam WorkFlowStatus status) {
        return ApiResponse.ok("Complaint status updated", complaintService.updateStatus(id, status));
    }
}
