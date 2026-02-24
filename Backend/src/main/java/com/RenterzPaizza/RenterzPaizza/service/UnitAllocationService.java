package com.RenterzPaizza.RenterzPaizza.service;

import com.RenterzPaizza.RenterzPaizza.dto.UnitAllocationRequest;
import com.RenterzPaizza.RenterzPaizza.dto.UnitAllocationResponse;
import com.RenterzPaizza.RenterzPaizza.entity.Unit;
import com.RenterzPaizza.RenterzPaizza.entity.UnitAllocation;
import com.RenterzPaizza.RenterzPaizza.entity.User;
import com.RenterzPaizza.RenterzPaizza.entity.enums.EntityStatus;
import com.RenterzPaizza.RenterzPaizza.entity.enums.Role;
import com.RenterzPaizza.RenterzPaizza.entity.enums.UnitStatus;
import com.RenterzPaizza.RenterzPaizza.exception.BadRequestException;
import com.RenterzPaizza.RenterzPaizza.exception.ForbiddenException;
import com.RenterzPaizza.RenterzPaizza.exception.NotFoundException;
import com.RenterzPaizza.RenterzPaizza.mapper.UnitAllocationMapper;
import com.RenterzPaizza.RenterzPaizza.repository.UnitAllocationRepository;
import com.RenterzPaizza.RenterzPaizza.repository.UnitRepository;
import com.RenterzPaizza.RenterzPaizza.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class UnitAllocationService {

    private final UnitAllocationRepository allocationRepository;
    private final UnitAllocationMapper allocationMapper;
    private final UnitRepository unitRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;

    public UnitAllocationService(UnitAllocationRepository allocationRepository,
                                 UnitAllocationMapper allocationMapper,
                                 UnitRepository unitRepository,
                                 UserRepository userRepository,
                                 CurrentUserService currentUserService) {
        this.allocationRepository = allocationRepository;
        this.allocationMapper = allocationMapper;
        this.unitRepository = unitRepository;
        this.userRepository = userRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional
    public UnitAllocationResponse create(UnitAllocationRequest request) {
        User owner = currentUserService.getCurrentUser();
        Unit unit = unitRepository.findById(request.getUnitId())
                .orElseThrow(() -> new NotFoundException("Unit not found"));

        if (!unit.getOwner().getUserId().equals(owner.getUserId())) {
            throw new ForbiddenException("Owner can only allocate own units");
        }
        if (unit.getStatus() == UnitStatus.OCCUPIED) {
            throw new BadRequestException("Unit is already occupied");
        }

        User tenant = userRepository.findById(request.getTenantId())
                .orElseThrow(() -> new NotFoundException("Tenant not found"));
        if (tenant.getRole() != Role.TENANT) {
            throw new BadRequestException("Selected user is not a tenant");
        }
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new BadRequestException("End date must be after start date");
        }

        UnitAllocation allocation = UnitAllocation.builder()
                .unit(unit)
                .tenant(tenant)
                .occupancyType(request.getOccupancyType())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(EntityStatus.ACTIVE)
                .build();

        unit.setStatus(UnitStatus.OCCUPIED);
        unitRepository.save(unit);

        return allocationMapper.toResponse(allocationRepository.save(allocation));
    }

    public Page<UnitAllocationResponse> listForOwner(Pageable pageable) {
        User owner = currentUserService.getCurrentUser();
        return allocationRepository.findByUnitOwnerUserIdAndDeletedFalse(owner.getUserId(), pageable)
                .map(allocationMapper::toResponse);
    }

    public Page<UnitAllocationResponse> listForTenant(Pageable pageable) {
        User tenant = currentUserService.getCurrentUser();
        return allocationRepository.findByTenantUserIdAndDeletedFalse(tenant.getUserId(), pageable)
                .map(allocationMapper::toResponse);
    }

    @Transactional
    public UnitAllocationResponse terminate(Long allocationId) {
        User owner = currentUserService.getCurrentUser();
        UnitAllocation allocation = allocationRepository.findById(allocationId)
                .orElseThrow(() -> new NotFoundException("Allocation not found"));

        if (!allocation.getUnit().getOwner().getUserId().equals(owner.getUserId())) {
            throw new ForbiddenException("Owner can only terminate own allocations");
        }

        allocation.setStatus(EntityStatus.TERMINATED);
        Unit unit = allocation.getUnit();
        unit.setStatus(UnitStatus.AVAILABLE);

        unitRepository.save(unit);
        return allocationMapper.toResponse(allocationRepository.save(allocation));
    }
}
