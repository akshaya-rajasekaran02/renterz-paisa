package com.RenterzPaizza.RenterzPaizza.controller;

import com.RenterzPaizza.RenterzPaizza.common.ApiResponse;
import com.RenterzPaizza.RenterzPaizza.common.PageMapper;
import com.RenterzPaizza.RenterzPaizza.common.PageResponse;
import com.RenterzPaizza.RenterzPaizza.dto.PropertyRequest;
import com.RenterzPaizza.RenterzPaizza.dto.PropertyResponse;
import com.RenterzPaizza.RenterzPaizza.entity.enums.EntityStatus;
import com.RenterzPaizza.RenterzPaizza.service.PropertyService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/properties")
public class PropertyController {

    private final PropertyService propertyService;

    public PropertyController(PropertyService propertyService) {
        this.propertyService = propertyService;
    }

    @PostMapping
    public ApiResponse<PropertyResponse> create(@Valid @RequestBody PropertyRequest request,
                                                @RequestParam Long adminId) {
        return ApiResponse.ok("Property created", propertyService.create(request, adminId));
    }

    @GetMapping("/{id}")
    public ApiResponse<PropertyResponse> getById(@PathVariable Long id) {
        return ApiResponse.ok("Property fetched", propertyService.getById(id));
    }

    @GetMapping
    public ApiResponse<PageResponse<PropertyResponse>> list(@RequestParam(required = false) String city,
                                                            @RequestParam(required = false) EntityStatus status,
                                                            Pageable pageable) {
        Page<PropertyResponse> page = propertyService.list(city, status, pageable);
        return ApiResponse.ok("Properties fetched", PageMapper.toPageResponse(page));
    }

    @PutMapping("/{id}")
    public ApiResponse<PropertyResponse> update(@PathVariable Long id,
                                                @Valid @RequestBody PropertyRequest request) {
        return ApiResponse.ok("Property updated", propertyService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        propertyService.softDelete(id);
        return ApiResponse.ok("Property deleted");
    }
}
