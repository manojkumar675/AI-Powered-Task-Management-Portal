package com.taskportal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLogResponse {
    private UUID id;
    private UUID taskId;
    private String actionType;
    private String payloadHash;
    private String previousHash;
    private String currentHash;
    private LocalDateTime timestamp;
}
