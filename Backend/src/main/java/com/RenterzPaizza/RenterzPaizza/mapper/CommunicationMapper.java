package com.RenterzPaizza.RenterzPaizza.mapper;

import com.RenterzPaizza.RenterzPaizza.dto.CommunicationResponse;
import com.RenterzPaizza.RenterzPaizza.entity.Communication;
import org.springframework.stereotype.Component;

@Component
public class CommunicationMapper {
    public CommunicationResponse toResponse(Communication communication) {
        return CommunicationResponse.builder()
                .communicationId(communication.getCommunicationId())
                .userId(communication.getUser().getUserId())
                .channel(communication.getChannel())
                .templateName(communication.getTemplateName())
                .message(communication.getMessage())
                .status(communication.getStatus())
                .createdAt(communication.getCreatedAt())
                .updatedAt(communication.getUpdatedAt())
                .build();
    }
}
