package com.RenterzPaizza.RenterzPaizza.dto;

import com.RenterzPaizza.RenterzPaizza.entity.enums.EntityStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class PropertyResponse {
    private Long propertyId;
    private String propertyName;
    private String propertyType;
    private String address;
    private String city;
    private EntityStatus status;
    private Long adminId;
    private Integer units;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
