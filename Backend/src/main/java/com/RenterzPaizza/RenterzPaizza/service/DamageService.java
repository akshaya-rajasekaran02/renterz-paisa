package com.RenterzPaizza.RenterzPaizza.service;

import com.RenterzPaizza.RenterzPaizza.dto.DamageRequest;
import com.RenterzPaizza.RenterzPaizza.dto.DamageResponse;
import com.RenterzPaizza.RenterzPaizza.entity.DamageReport;
import com.RenterzPaizza.RenterzPaizza.entity.Unit;
import com.RenterzPaizza.RenterzPaizza.entity.User;
import com.RenterzPaizza.RenterzPaizza.entity.enums.DamageStatus;
import com.RenterzPaizza.RenterzPaizza.exception.ForbiddenException;
import com.RenterzPaizza.RenterzPaizza.exception.NotFoundException;
import com.RenterzPaizza.RenterzPaizza.mapper.DamageMapper;
import com.RenterzPaizza.RenterzPaizza.repository.DamageRepository;
import com.RenterzPaizza.RenterzPaizza.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class DamageService {

    private final DamageRepository damageRepository;
    private final DamageMapper damageMapper;
    private final UnitService unitService;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;
    private final CommunicationService communicationService;

    public DamageService(DamageRepository damageRepository,
                         DamageMapper damageMapper,
                         UnitService unitService,
                         UserRepository userRepository,
                         CurrentUserService currentUserService,
                         CommunicationService communicationService) {
        this.damageRepository = damageRepository;
        this.damageMapper = damageMapper;
        this.unitService = unitService;
        this.userRepository = userRepository;
        this.currentUserService = currentUserService;
        this.communicationService = communicationService;
    }

    @Transactional
    public DamageResponse createDamageBill(DamageRequest request) {
        User owner = currentUserService.getCurrentUser();
        Unit unit = unitService.getById(request.getUnitId());
        if (!unit.getOwner().getUserId().equals(owner.getUserId())) {
            throw new ForbiddenException("Owner can only create damage bills for own units");
        }

        User tenant = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new NotFoundException("Tenant not found"));

        DamageReport report = DamageReport.builder()
                .unit(unit)
                .user(tenant)
                .description(request.getDescription())
                .beforeImage(request.getBeforeImage())
                .afterImage(request.getAfterImage())
                .estimatedCost(request.getEstimatedCost())
                .status(DamageStatus.CHARGED)
                .billed(true)
                .build();

        DamageReport saved = damageRepository.save(report);
        communicationService.enqueueDamageBilling(tenant, saved);
        return damageMapper.toResponse(saved);
    }

    public Page<DamageResponse> listForOwner(Pageable pageable) {
        User owner = currentUserService.getCurrentUser();
        return damageRepository.findByUnitOwnerUserIdAndDeletedFalse(owner.getUserId(), pageable)
                .map(damageMapper::toResponse);
    }

    public Page<DamageResponse> listForTenant(Pageable pageable) {
        User tenant = currentUserService.getCurrentUser();
        return damageRepository.findByUserUserIdAndDeletedFalse(tenant.getUserId(), pageable)
                .map(damageMapper::toResponse);
    }
}
