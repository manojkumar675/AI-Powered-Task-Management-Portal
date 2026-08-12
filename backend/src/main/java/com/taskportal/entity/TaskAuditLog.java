package com.taskportal.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "task_audit_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "task_id", nullable = false)
    private UUID taskId;

    @Column(name = "action_type", nullable = false, length = 50)
    private String actionType;

    @Column(name = "payload_hash", nullable = false, columnDefinition = "TEXT")
    private String payloadHash;

    @Column(name = "previous_hash", nullable = false, columnDefinition = "TEXT")
    private String previousHash;

    @Column(name = "current_hash", nullable = false, columnDefinition = "TEXT")
    private String currentHash;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @PrePersist
    public void prePersist() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }
}
