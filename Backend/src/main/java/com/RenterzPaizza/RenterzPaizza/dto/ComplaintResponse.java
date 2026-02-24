package com.RenterzPaizza.RenterzPaizza.dto;

import com.RenterzPaizza.RenterzPaizza.entity.enums.WorkFlowStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class ComplaintResponse {
    private Long complaintId;
    private Long userId;
    private String userName;
    private String userRole;
    private Long unitId;
    private String unitNumber;
    private String title;
    private String description;
    private WorkFlowStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
