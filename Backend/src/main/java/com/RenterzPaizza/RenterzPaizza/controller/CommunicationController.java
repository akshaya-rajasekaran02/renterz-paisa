package com.RenterzPaizza.RenterzPaizza.controller;

import com.RenterzPaizza.RenterzPaizza.common.ApiResponse;
import com.RenterzPaizza.RenterzPaizza.common.PageMapper;
import com.RenterzPaizza.RenterzPaizza.common.PageResponse;
import com.RenterzPaizza.RenterzPaizza.dto.CommunicationResponse;
import com.RenterzPaizza.RenterzPaizza.service.CommunicationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CommunicationController {

    private final CommunicationService communicationService;

    public CommunicationController(CommunicationService communicationService) {
        this.communicationService = communicationService;
    }

    @GetMapping("/api/common/communications")
    public ApiResponse<PageResponse<CommunicationResponse>> myCommunications(Pageable pageable) {
        Page<CommunicationResponse> page = communicationService.myCommunications(pageable);
        return ApiResponse.ok("Communications fetched", PageMapper.toPageResponse(page));
    }
}
