package com.RenterzPaizza.RenterzPaizza.entity;

import com.RenterzPaizza.RenterzPaizza.entity.base.AuditableSoftDeleteEntity;
import com.RenterzPaizza.RenterzPaizza.entity.enums.BillingStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "rent")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Rent extends AuditableSoftDeleteEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long rentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "allocation_id", nullable = false)
    private UnitAllocation allocation;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private BillingStatus status = BillingStatus.DUE;

    @Column(nullable = false)
    private String billingMonth;
}
