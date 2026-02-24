package com.RenterzPaizza.RenterzPaizza.mapper;

import com.RenterzPaizza.RenterzPaizza.dto.PropertyRequest;
import com.RenterzPaizza.RenterzPaizza.dto.PropertyResponse;
import com.RenterzPaizza.RenterzPaizza.entity.Property;
import com.RenterzPaizza.RenterzPaizza.entity.User;
import org.springframework.stereotype.Component;

@Component
public class PropertyMapper {

    public Property toEntity(PropertyRequest request, User admin) {
        return Property.builder()
                .propertyName(request.getPropertyName())
                .propertyType(request.getPropertyType())
                .address(request.getAddress())
                .city(request.getCity())
                .admin(admin)
                .build();
    }

    public PropertyResponse toResponse(Property property) {
        return PropertyResponse.builder()
                .propertyId(property.getPropertyId())
                .propertyName(property.getPropertyName())
                .propertyType(property.getPropertyType().name())
                .address(property.getAddress())
                .city(property.getCity())
                .status(property.getStatus())
                .adminId(property.getAdmin().getUserId())
                .createdAt(property.getCreatedAt())
                .updatedAt(property.getUpdatedAt())
                .build();
    }
}
