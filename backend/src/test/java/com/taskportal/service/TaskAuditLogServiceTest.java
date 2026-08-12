package com.taskportal.service;

import com.taskportal.entity.TaskAuditLog;
import com.taskportal.repository.TaskAuditLogRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskAuditLogServiceTest {

    @Mock
    private TaskAuditLogRepository auditLogRepository;

    @InjectMocks
    private TaskAuditLogService auditLogService;

    @Test
    void logAction_ShouldCreateGenesisEntry() {
        UUID taskId = UUID.randomUUID();
        when(auditLogRepository.findTopByTaskIdOrderByTimestampDesc(taskId))
                .thenReturn(Optional.empty());

        auditLogService.logAction(taskId, "TASK_CREATED", "payload");

        ArgumentCaptor<TaskAuditLog> captor = ArgumentCaptor.forClass(TaskAuditLog.class);
        verify(auditLogRepository).save(captor.capture());

        TaskAuditLog saved = captor.getValue();
        assertThat(saved.getPreviousHash()).isEqualTo("0");
        assertThat(saved.getActionType()).isEqualTo("TASK_CREATED");
        assertThat(saved.getCurrentHash()).isNotEmpty();
        assertThat(saved.getPayloadHash()).isNotEmpty();
    }

    @Test
    void logAction_ShouldChainToPreviousHash() {
        UUID taskId = UUID.randomUUID();
        TaskAuditLog previous = TaskAuditLog.builder()
                .currentHash("previous-hash-value")
                .build();

        when(auditLogRepository.findTopByTaskIdOrderByTimestampDesc(taskId))
                .thenReturn(Optional.of(previous));

        auditLogService.logAction(taskId, "TASK_UPDATED", "new payload");

        ArgumentCaptor<TaskAuditLog> captor = ArgumentCaptor.forClass(TaskAuditLog.class);
        verify(auditLogRepository).save(captor.capture());

        TaskAuditLog saved = captor.getValue();
        assertThat(saved.getPreviousHash()).isEqualTo("previous-hash-value");
    }

    @Test
    void verifyIntegrity_ShouldReturnTrueForValidChain() {
        UUID taskId = UUID.randomUUID();

        String payload1 = TaskAuditLogService.sha256("TASK_CREATED|" + taskId + "|payload1");
        String hash1 = TaskAuditLogService.sha256(payload1 + "0");

        String payload2 = TaskAuditLogService.sha256("TASK_UPDATED|" + taskId + "|payload2");
        String hash2 = TaskAuditLogService.sha256(payload2 + hash1);

        List<TaskAuditLog> logs = List.of(
                TaskAuditLog.builder()
                        .payloadHash(payload1)
                        .previousHash("0")
                        .currentHash(hash1)
                        .build(),
                TaskAuditLog.builder()
                        .payloadHash(payload2)
                        .previousHash(hash1)
                        .currentHash(hash2)
                        .build()
        );

        when(auditLogRepository.findByTaskIdOrderByTimestampAsc(taskId)).thenReturn(logs);

        boolean result = auditLogService.verifyIntegrity(taskId);
        assertThat(result).isTrue();
    }

    @Test
    void verifyIntegrity_ShouldReturnFalseForTamperedChain() {
        UUID taskId = UUID.randomUUID();

        List<TaskAuditLog> logs = List.of(
                TaskAuditLog.builder()
                        .payloadHash("hash1")
                        .previousHash("0")
                        .currentHash("tampered-hash")
                        .build()
        );

        when(auditLogRepository.findByTaskIdOrderByTimestampAsc(taskId)).thenReturn(logs);

        boolean result = auditLogService.verifyIntegrity(taskId);
        assertThat(result).isFalse();
    }

    @Test
    void verifyIntegrity_ShouldReturnTrueForEmptyHistory() {
        UUID taskId = UUID.randomUUID();
        when(auditLogRepository.findByTaskIdOrderByTimestampAsc(taskId)).thenReturn(List.of());

        boolean result = auditLogService.verifyIntegrity(taskId);
        assertThat(result).isTrue();
    }

    @Test
    void sha256_ShouldProduceDeterministicOutput() {
        String hash1 = TaskAuditLogService.sha256("test input");
        String hash2 = TaskAuditLogService.sha256("test input");
        assertThat(hash1).isEqualTo(hash2);
        assertThat(hash1).hasSize(64); // SHA-256 = 64 hex chars
    }
}
