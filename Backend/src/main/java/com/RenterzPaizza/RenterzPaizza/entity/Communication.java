package com.RenterzPaizza.RenterzPaizza.entity;

import com.RenterzPaizza.RenterzPaizza.entity.base.AuditableSoftDeleteEntity;
import com.RenterzPaizza.RenterzPaizza.entity.enums.CommunicationChannel;
import com.RenterzPaizza.RenterzPaizza.entity.enums.CommunicationStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "communication")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Communication extends AuditableSoftDeleteEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long communicationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CommunicationChannel channel;

    @Column(nullable = false)
    private String templateName;

    @Column(nullable = false, length = 2000)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private CommunicationStatus status = CommunicationStatus.PENDING;
}
