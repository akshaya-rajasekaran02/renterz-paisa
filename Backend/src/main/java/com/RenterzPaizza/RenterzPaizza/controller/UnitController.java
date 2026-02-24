package com.RenterzPaizza.RenterzPaizza.controller;

import com.RenterzPaizza.RenterzPaizza.common.ApiResponse;
import com.RenterzPaizza.RenterzPaizza.common.PageMapper;
import com.RenterzPaizza.RenterzPaizza.common.PageResponse;
import com.RenterzPaizza.RenterzPaizza.dto.UnitRequest;
import com.RenterzPaizza.RenterzPaizza.dto.UnitResponse;
import com.RenterzPaizza.RenterzPaizza.entity.enums.UnitStatus;
import com.RenterzPaizza.RenterzPaizza.service.UnitService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/owner/units")
public class UnitController {

    private final UnitService unitService;

    public UnitController(UnitService unitService) {
        this.unitService = unitService;
    }

    @PostMapping
    public ApiResponse<UnitResponse> create(@Valid @RequestBody UnitRequest request) {
        return ApiResponse.ok("Unit created", unitService.create(request));
    }

    @GetMapping
    public ApiResponse<PageResponse<UnitResponse>> list(@RequestParam(required = false) UnitStatus status,
                                                        Pageable pageable) {
        Page<UnitResponse> page = unitService.listOwnerUnits(status, pageable);
        return ApiResponse.ok("Units fetched", PageMapper.toPageResponse(page));
    }

    @PutMapping("/{unitId}")
    public ApiResponse<UnitResponse> update(@PathVariable Long unitId,
                                            @Valid @RequestBody UnitRequest request) {
        return ApiResponse.ok("Unit updated", unitService.update(unitId, request));
    }

    @DeleteMapping("/{unitId}")
    public ApiResponse<Void> delete(@PathVariable Long unitId) {
        unitService.softDelete(unitId);
        return ApiResponse.ok("Unit deleted");
    }
}
