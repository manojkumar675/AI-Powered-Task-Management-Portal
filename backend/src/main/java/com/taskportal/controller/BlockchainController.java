package com.taskportal.controller;

import com.taskportal.dto.AuditLogResponse;
import com.taskportal.dto.BlockchainVerificationResponse;
import com.taskportal.entity.TaskAuditLog;
import com.taskportal.service.TaskAuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tasks")
@Tag(name = "Blockchain", description = "Task audit trail and blockchain verification")
public class BlockchainController {

    private final TaskAuditLogService auditLogService;

    public BlockchainController(TaskAuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping("/{id}/history")
    @Operation(summary = "Get task audit trail (blockchain history)")
    public ResponseEntity<List<AuditLogResponse>> getHistory(@PathVariable UUID id) {
        List<TaskAuditLog> logs = auditLogService.getHistory(id);
        List<AuditLogResponse> response = logs.stream()
                .map(this::mapToResponse)
                .toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/history/verify")
    @Operation(summary = "Verify blockchain integrity for task audit trail")
    public ResponseEntity<BlockchainVerificationResponse> verifyIntegrity(@PathVariable UUID id) {
        boolean valid = auditLogService.verifyIntegrity(id);
        BlockchainVerificationResponse response = BlockchainVerificationResponse.builder()
                .valid(valid)
                .message(valid ? "Blockchain integrity verified. All hashes are valid."
                        : "Blockchain integrity compromised. Hash chain is broken.")
                .build();
        return ResponseEntity.ok(response);
    }

    private AuditLogResponse mapToResponse(TaskAuditLog log) {
        return AuditLogResponse.builder()
                .id(log.getId())
                .taskId(log.getTaskId())
                .actionType(log.getActionType())
                .payloadHash(log.getPayloadHash())
                .previousHash(log.getPreviousHash())
                .currentHash(log.getCurrentHash())
                .timestamp(log.getTimestamp())
                .build();
    }
}
