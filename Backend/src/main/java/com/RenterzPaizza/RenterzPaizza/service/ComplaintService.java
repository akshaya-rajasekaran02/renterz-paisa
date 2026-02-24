package com.RenterzPaizza.RenterzPaizza.service;

import com.RenterzPaizza.RenterzPaizza.dto.ComplaintRequest;
import com.RenterzPaizza.RenterzPaizza.dto.ComplaintResponse;
import com.RenterzPaizza.RenterzPaizza.entity.Complaint;
import com.RenterzPaizza.RenterzPaizza.entity.Unit;
import com.RenterzPaizza.RenterzPaizza.entity.User;
import com.RenterzPaizza.RenterzPaizza.entity.enums.WorkFlowStatus;
import com.RenterzPaizza.RenterzPaizza.exception.ForbiddenException;
import com.RenterzPaizza.RenterzPaizza.exception.NotFoundException;
import com.RenterzPaizza.RenterzPaizza.mapper.ComplaintMapper;
import com.RenterzPaizza.RenterzPaizza.repository.ComplaintRepository;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final CurrentUserService currentUserService;
    private final UnitService unitService;
    private final ComplaintMapper complaintMapper;

    public ComplaintService(ComplaintRepository complaintRepository,
            CurrentUserService currentUserService,
            UnitService unitService,
            ComplaintMapper complaintMapper) {
        this.complaintRepository = complaintRepository;
        this.currentUserService = currentUserService;
        this.unitService = unitService;
        this.complaintMapper = complaintMapper;
    }

    @Transactional
    public ComplaintResponse create(ComplaintRequest request) {
        User tenant = currentUserService.getCurrentUser();
        Unit unit = unitService.getById(request.getUnitId());

        Complaint complaint = Complaint.builder()
                .user(tenant)
                .unit(unit)
                .title(request.getTitle())
                .description(request.getDescription())
                .status(WorkFlowStatus.OPEN)
                .build();

        return complaintMapper.toResponse(complaintRepository.save(complaint));
    }

    public Page<ComplaintResponse> listForTenant(Pageable pageable) {
        User tenant = currentUserService.getCurrentUser();
        return complaintRepository.findByUserUserIdAndDeletedFalse(tenant.getUserId(), pageable)
                .map(complaintMapper::toResponse);
    }

    public Page<ComplaintResponse> listForOwner(Pageable pageable) {
        User owner = currentUserService.getCurrentUser();
        return complaintRepository.findByUnitOwnerUserIdAndDeletedFalse(owner.getUserId(), pageable)
                .map(complaintMapper::toResponse);
    }

    @Transactional
    public List<ComplaintResponse> listAll() {
        return complaintRepository.findByDeletedFalse()
                .stream()
                .map(complaintMapper::toResponse)
                .toList();
    }

    @Transactional
    public ComplaintResponse updateStatus(Long complaintId, WorkFlowStatus status) {
        User owner = currentUserService.getCurrentUser();
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new NotFoundException("Complaint not found"));

        if (!complaint.getUnit().getOwner().getUserId().equals(owner.getUserId())) {
            throw new ForbiddenException("Owner can update only own unit complaints");
        }

        complaint.setStatus(status);
        return complaintMapper.toResponse(complaintRepository.save(complaint));
    }
}
