package com.RenterzPaizza.RenterzPaizza.dto;

import com.RenterzPaizza.RenterzPaizza.entity.enums.CommunicationChannel;
import com.RenterzPaizza.RenterzPaizza.entity.enums.CommunicationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class CommunicationResponse {
    private Long communicationId;
    private Long userId;
    private CommunicationChannel channel;
    private String templateName;
    private String message;
    private CommunicationStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
