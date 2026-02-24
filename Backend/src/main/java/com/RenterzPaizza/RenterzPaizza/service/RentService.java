package com.RenterzPaizza.RenterzPaizza.service;

import com.RenterzPaizza.RenterzPaizza.dto.RentResponse;
import com.RenterzPaizza.RenterzPaizza.entity.Rent;
import com.RenterzPaizza.RenterzPaizza.entity.UnitAllocation;
import com.RenterzPaizza.RenterzPaizza.entity.User;
import com.RenterzPaizza.RenterzPaizza.entity.enums.BillingStatus;
import com.RenterzPaizza.RenterzPaizza.entity.enums.EntityStatus;
import com.RenterzPaizza.RenterzPaizza.mapper.RentMapper;
import com.RenterzPaizza.RenterzPaizza.repository.RentRepository;
import com.RenterzPaizza.RenterzPaizza.repository.UnitAllocationRepository;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;

@Service
public class RentService {

    private final RentRepository rentRepository;
    private final UnitAllocationRepository allocationRepository;
    private final RentMapper rentMapper;
    private final CurrentUserService currentUserService;
    private final CommunicationService communicationService;

    public RentService(RentRepository rentRepository,
                       UnitAllocationRepository allocationRepository,
                       RentMapper rentMapper,
                       CurrentUserService currentUserService,
                       CommunicationService communicationService) {
        this.rentRepository = rentRepository;
        this.allocationRepository = allocationRepository;
        this.rentMapper = rentMapper;
        this.currentUserService = currentUserService;
        this.communicationService = communicationService;
    }

    public Page<RentResponse> listForTenant(Pageable pageable) {
        User tenant = currentUserService.getCurrentUser();
        return rentRepository.findByAllocationTenantUserIdAndDeletedFalse(tenant.getUserId(), pageable)
                .map(rentMapper::toResponse);
    }

    public Page<RentResponse> listForOwner(Pageable pageable) {
        User owner = currentUserService.getCurrentUser();
        return rentRepository.findByAllocationUnitOwnerUserIdAndDeletedFalse(owner.getUserId(), pageable)
                .map(rentMapper::toResponse);
    }

    @Transactional
    public List<RentResponse> generateMonthlyRent() {
        LocalDate today = LocalDate.now();
        String billingMonth = YearMonth.now().toString();
        LocalDate dueDate = today.withDayOfMonth(5);

        List<UnitAllocation> activeAllocations = allocationRepository
                .findByStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqualAndDeletedFalse(
                        EntityStatus.ACTIVE,
                        today,
                        today
                );

        List<RentResponse> generated = new ArrayList<>();
        for (UnitAllocation allocation : activeAllocations) {
            boolean exists = rentRepository.existsByAllocationAndBillingMonthAndDeletedFalse(allocation, billingMonth);
            if (exists) {
                continue;
            }

            Rent rent = Rent.builder()
                    .allocation(allocation)
                    .amount(allocation.getUnit().getMonthlyRent())
                    .billingMonth(billingMonth)
                    .dueDate(dueDate)
                    .status(BillingStatus.DUE)
                    .build();

            Rent saved = rentRepository.save(rent);
            generated.add(rentMapper.toResponse(saved));
            communicationService.enqueueRentGenerated(saved.getAllocation().getTenant(), saved);
        }

        return generated;
    }

    @Transactional
    public int markOverdueRents() {
        List<Rent> dueRents = rentRepository.findByStatusAndDueDateBeforeAndDeletedFalse(BillingStatus.DUE, LocalDate.now());
        int updated = 0;
        for (Rent rent : dueRents) {
            rent.setStatus(BillingStatus.OVERDUE);
            rentRepository.save(rent);
            communicationService.enqueueOverdue(rent.getAllocation().getTenant(), rent);
            updated++;
        }
        return updated;
    }
}
