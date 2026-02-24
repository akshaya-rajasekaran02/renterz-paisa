package com.RenterzPaizza.RenterzPaizza.entity;

import com.RenterzPaizza.RenterzPaizza.entity.base.AuditableSoftDeleteEntity;
import com.RenterzPaizza.RenterzPaizza.entity.enums.DamageStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "damage_report")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DamageReport extends AuditableSoftDeleteEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long damageId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id", nullable = false)
    private Unit unit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String description;

    private String beforeImage;

    private String afterImage;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal estimatedCost;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private DamageStatus status = DamageStatus.OPEN;

    @Column(nullable = false)
    @Builder.Default
    private Boolean billed = false;
}
