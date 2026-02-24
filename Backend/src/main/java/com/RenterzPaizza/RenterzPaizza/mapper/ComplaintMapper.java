package com.RenterzPaizza.RenterzPaizza.mapper;

import com.RenterzPaizza.RenterzPaizza.dto.ComplaintResponse;
import com.RenterzPaizza.RenterzPaizza.entity.Complaint;
import org.springframework.stereotype.Component;

@Component
public class ComplaintMapper {
    public ComplaintResponse toResponse(Complaint complaint) {
        return ComplaintResponse.builder()
                .complaintId(complaint.getComplaintId())
                .userId(complaint.getUser().getUserId())
                .userName(complaint.getUser().getName())
                .userRole(complaint.getUser().getRole().name())
                .unitId(complaint.getUnit().getUnitId())
                .unitNumber(complaint.getUnit().getUnitNumber())
                .title(complaint.getTitle())
                .description(complaint.getDescription())
                .status(complaint.getStatus())
                .createdAt(complaint.getCreatedAt())
                .updatedAt(complaint.getUpdatedAt())
                .build();
    }
}
