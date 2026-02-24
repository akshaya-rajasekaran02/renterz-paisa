package com.RenterzPaizza.RenterzPaizza.service;

import com.RenterzPaizza.RenterzPaizza.dto.UnitRequest;
import com.RenterzPaizza.RenterzPaizza.dto.UnitResponse;
import com.RenterzPaizza.RenterzPaizza.entity.Property;
import com.RenterzPaizza.RenterzPaizza.entity.Unit;
import com.RenterzPaizza.RenterzPaizza.entity.User;
import com.RenterzPaizza.RenterzPaizza.entity.enums.UnitStatus;
import com.RenterzPaizza.RenterzPaizza.exception.ForbiddenException;
import com.RenterzPaizza.RenterzPaizza.exception.NotFoundException;
import com.RenterzPaizza.RenterzPaizza.mapper.UnitMapper;
import com.RenterzPaizza.RenterzPaizza.repository.UnitRepository;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UnitService {

    private final UnitRepository unitRepository;
    private final UnitMapper unitMapper;
    private final PropertyService propertyService;
    private final CurrentUserService currentUserService;

    public UnitService(UnitRepository unitRepository,
            UnitMapper unitMapper,
            PropertyService propertyService,
            CurrentUserService currentUserService) {
        this.unitRepository = unitRepository;
        this.unitMapper = unitMapper;
        this.propertyService = propertyService;
        this.currentUserService = currentUserService;
    }

    @Transactional
    public UnitResponse create(UnitRequest request) {
        User owner = currentUserService.getCurrentUser();
        Property property = propertyService.getEntity(request.getPropertyId());
        Unit saved = unitRepository.save(unitMapper.toEntity(request, property, owner));
        return unitMapper.toResponse(saved);
    }

    public Page<UnitResponse> listOwnerUnits(UnitStatus status, Pageable pageable) {
        User owner = currentUserService.getCurrentUser();
        Page<Unit> page = status == null
                ? unitRepository.findByOwnerUserIdAndDeletedFalse(owner.getUserId(), pageable)
                : unitRepository.findByOwnerUserIdAndStatusAndDeletedFalse(owner.getUserId(), status, pageable);
        return page.map(unitMapper::toResponse);
    }

    @Transactional
    public UnitResponse update(Long unitId, UnitRequest request) {
        User owner = currentUserService.getCurrentUser();
        Unit unit = getOwnedUnit(unitId, owner.getUserId());
        Property property = propertyService.getEntity(request.getPropertyId());

        unit.setUnitNumber(request.getUnitNumber());
        unit.setUnitType(request.getUnitType());
        unit.setFloor(request.getFloor());
        unit.setMonthlyRent(request.getMonthlyRent());
        unit.setProperty(property);

        return unitMapper.toResponse(unitRepository.save(unit));
    }

    @Transactional
    public void softDelete(Long unitId) {
        User owner = currentUserService.getCurrentUser();
        Unit unit = getOwnedUnit(unitId, owner.getUserId());
        unit.setDeleted(true);
        unit.setStatus(UnitStatus.INACTIVE);
        unitRepository.save(unit);
    }

    public Unit getById(Long id) {
        Unit unit = unitRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Unit not found"));
        if (Boolean.TRUE.equals(unit.getDeleted())) {
            throw new NotFoundException("Unit not found");
        }
        return unit;
    }

    private Unit getOwnedUnit(Long unitId, Long ownerId) {
        Unit unit = getById(unitId);
        if (!unit.getOwner().getUserId().equals(ownerId)) {
            throw new ForbiddenException("Owner can only access own units");
        }
        return unit;
    }

    public List<UnitResponse> getUnitsByProperty(Long propertyId) {
        Property property = propertyService.getEntity(propertyId);
        List<Unit> units = unitRepository.findByPropertyPropertyIdAndDeletedFalse(propertyId, Pageable.unpaged())
                .getContent();
        return units.stream().map(unitMapper::toResponse).toList();
    }

    @Transactional
    public List<UnitResponse> getAllUnits() {
        List<Unit> units = unitRepository.findByDeletedFalse(Pageable.unpaged()).getContent();
        return units.stream().map(unitMapper::toResponse).toList();
    }
}
