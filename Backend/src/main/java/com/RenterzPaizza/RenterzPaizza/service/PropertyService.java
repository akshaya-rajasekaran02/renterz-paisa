package com.RenterzPaizza.RenterzPaizza.service;

import com.RenterzPaizza.RenterzPaizza.dto.PropertyRequest;
import com.RenterzPaizza.RenterzPaizza.dto.PropertyResponse;
import com.RenterzPaizza.RenterzPaizza.entity.Property;
import com.RenterzPaizza.RenterzPaizza.entity.User;
import com.RenterzPaizza.RenterzPaizza.entity.enums.EntityStatus;
import com.RenterzPaizza.RenterzPaizza.exception.NotFoundException;
import com.RenterzPaizza.RenterzPaizza.mapper.PropertyMapper;
import com.RenterzPaizza.RenterzPaizza.repository.PropertyRepository;
import com.RenterzPaizza.RenterzPaizza.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class PropertyService {

    private final PropertyRepository propertyRepository;
    private final PropertyMapper propertyMapper;
    private final UserRepository userRepository;

    public PropertyService(PropertyRepository propertyRepository,
            PropertyMapper propertyMapper,
            UserRepository userRepository) {
        this.propertyRepository = propertyRepository;
        this.propertyMapper = propertyMapper;
        this.userRepository = userRepository;
    }

    @Transactional
    public PropertyResponse create(PropertyRequest request, Long adminId) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new NotFoundException("Admin not found"));

        Property saved = propertyRepository.save(propertyMapper.toEntity(request, admin));
        return propertyMapper.toResponse(saved);
    }

    public PropertyResponse getById(Long id) {
        return propertyMapper.toResponse(getEntity(id));
    }

    public Page<PropertyResponse> list(String city, EntityStatus status, Pageable pageable) {
        Page<Property> page;
        if (city != null && !city.isBlank()) {
            page = propertyRepository.findByCityContainingIgnoreCaseAndDeletedFalse(city, pageable);
        } else if (status != null) {
            page = propertyRepository.findByStatusAndDeletedFalse(status, pageable);
        } else {
            page = propertyRepository.findByDeletedFalse(pageable);
        }
        return page.map(propertyMapper::toResponse);
    }

    @Transactional
    public PropertyResponse update(Long id, PropertyRequest request) {
        Property property = getEntity(id);
        property.setPropertyName(request.getPropertyName());
        property.setPropertyType(request.getPropertyType());
        property.setAddress(request.getAddress());
        property.setCity(request.getCity());
        property.setUnits(request.getUnits() != null ? request.getUnits() : 0);
        return propertyMapper.toResponse(propertyRepository.save(property));
    }

    @Transactional
    public void softDelete(Long id) {
        Property property = getEntity(id);
        property.setDeleted(true);
        property.setStatus(EntityStatus.INACTIVE);
        propertyRepository.save(property);
    }

    public Property getEntity(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Property not found"));
        if (Boolean.TRUE.equals(property.getDeleted())) {
            throw new NotFoundException("Property not found");
        }
        return property;
    }
}
