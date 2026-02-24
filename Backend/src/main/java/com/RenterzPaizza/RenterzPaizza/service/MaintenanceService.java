package com.RenterzPaizza.RenterzPaizza.service;

import com.RenterzPaizza.RenterzPaizza.dto.MaintenanceRequest;
import com.RenterzPaizza.RenterzPaizza.dto.MaintenanceResponse;
import com.RenterzPaizza.RenterzPaizza.entity.Maintenance;
import com.RenterzPaizza.RenterzPaizza.entity.Unit;
import com.RenterzPaizza.RenterzPaizza.entity.UnitAllocation;
import com.RenterzPaizza.RenterzPaizza.entity.User;
import com.RenterzPaizza.RenterzPaizza.entity.enums.BillingStatus;
import com.RenterzPaizza.RenterzPaizza.entity.enums.EntityStatus;
import com.RenterzPaizza.RenterzPaizza.exception.ForbiddenException;
import com.RenterzPaizza.RenterzPaizza.mapper.MaintenanceMapper;
import com.RenterzPaizza.RenterzPaizza.repository.MaintenanceRepository;
import com.RenterzPaizza.RenterzPaizza.repository.UnitAllocationRepository;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class MaintenanceService {

    private final MaintenanceRepository maintenanceRepository;
    private final UnitService unitService;
    private final CurrentUserService currentUserService;
    private final MaintenanceMapper maintenanceMapper;
    private final UnitAllocationRepository allocationRepository;
    private final CommunicationService communicationService;

    public MaintenanceService(MaintenanceRepository maintenanceRepository,
                              UnitService unitService,
                              CurrentUserService currentUserService,
                              MaintenanceMapper maintenanceMapper,
                              UnitAllocationRepository allocationRepository,
                              CommunicationService communicationService) {
        this.maintenanceRepository = maintenanceRepository;
        this.unitService = unitService;
        this.currentUserService = currentUserService;
        this.maintenanceMapper = maintenanceMapper;
        this.allocationRepository = allocationRepository;
        this.communicationService = communicationService;
    }

    @Transactional
    public MaintenanceResponse create(MaintenanceRequest request) {
        User owner = currentUserService.getCurrentUser();
        Unit unit = unitService.getById(request.getUnitId());
        if (!unit.getOwner().getUserId().equals(owner.getUserId())) {
            throw new ForbiddenException("Owner can only bill maintenance for own units");
        }

        Maintenance maintenance = Maintenance.builder()
                .unit(unit)
                .title(request.getTitle())
                .amount(request.getAmount())
                .dueDate(request.getDueDate())
                .status(request.getStatus() != null ? request.getStatus() : BillingStatus.DUE)
                .build();

        Maintenance saved = maintenanceRepository.save(maintenance);

        List<UnitAllocation> active = allocationRepository
                .findByStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqualAndDeletedFalse(
                        EntityStatus.ACTIVE,
                        LocalDate.now(),
                        LocalDate.now()
                );

        active.stream()
                .filter(a -> a.getUnit().getUnitId().equals(unit.getUnitId()))
                .forEach(a -> communicationService.enqueueMaintenanceBilling(a.getTenant(), saved));

        return maintenanceMapper.toResponse(saved);
    }

    public Page<MaintenanceResponse> listForOwner(Pageable pageable) {
        User owner = currentUserService.getCurrentUser();
        return maintenanceRepository.findByUnitOwnerUserIdAndDeletedFalse(owner.getUserId(), pageable)
                .map(maintenanceMapper::toResponse);
    }
}
