package com.RenterzPaizza.RenterzPaizza.entity;

import com.RenterzPaizza.RenterzPaizza.entity.base.AuditableSoftDeleteEntity;
import com.RenterzPaizza.RenterzPaizza.entity.enums.WorkFlowStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "complaint")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Complaint extends AuditableSoftDeleteEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long complaintId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id", nullable = false)
    private Unit unit;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private WorkFlowStatus status = WorkFlowStatus.OPEN;
}
