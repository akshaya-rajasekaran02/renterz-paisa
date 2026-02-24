package com.RenterzPaizza.RenterzPaizza.mapper;

import com.RenterzPaizza.RenterzPaizza.dto.UnitRequest;
import com.RenterzPaizza.RenterzPaizza.dto.UnitResponse;
import com.RenterzPaizza.RenterzPaizza.entity.Property;
import com.RenterzPaizza.RenterzPaizza.entity.Unit;
import com.RenterzPaizza.RenterzPaizza.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UnitMapper {

    public Unit toEntity(UnitRequest request, Property property, User owner) {
        return Unit.builder()
                .unitNumber(request.getUnitNumber())
                .unitType(request.getUnitType())
                .floor(request.getFloor())
                .monthlyRent(request.getMonthlyRent())
                .property(property)
                .owner(owner)
                .build();
    }

    public UnitResponse toResponse(Unit unit) {
        return UnitResponse.builder()
                .unitId(unit.getUnitId())
                .unitNumber(unit.getUnitNumber())
                .unitType(unit.getUnitType())
                .floor(unit.getFloor())
                .monthlyRent(unit.getMonthlyRent())
                .status(unit.getStatus())
                .propertyId(unit.getProperty().getPropertyId())
                .ownerId(unit.getOwner().getUserId())
                .createdAt(unit.getCreatedAt())
                .updatedAt(unit.getUpdatedAt())
                .build();
    }
}
