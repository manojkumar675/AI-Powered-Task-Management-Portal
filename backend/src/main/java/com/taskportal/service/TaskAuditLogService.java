package com.taskportal.service;

import com.taskportal.entity.TaskAuditLog;
import com.taskportal.repository.TaskAuditLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class TaskAuditLogService {

    private static final Logger logger = LoggerFactory.getLogger(TaskAuditLogService.class);
    private static final String GENESIS_HASH = "0";

    private final TaskAuditLogRepository auditLogRepository;

    public TaskAuditLogService(TaskAuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public void logAction(UUID taskId, String actionType, String payload) {
        String previousHash = auditLogRepository.findTopByTaskIdOrderByTimestampDesc(taskId)
                .map(TaskAuditLog::getCurrentHash)
                .orElse(GENESIS_HASH);

        String payloadHash = sha256(actionType + "|" + taskId + "|" + payload);
        String currentHash = sha256(payloadHash + previousHash);

        TaskAuditLog log = TaskAuditLog.builder()
                .taskId(taskId)
                .actionType(actionType)
                .payloadHash(payloadHash)
                .previousHash(previousHash)
                .currentHash(currentHash)
                .timestamp(LocalDateTime.now())
                .build();

        auditLogRepository.save(log);
        logger.debug("Audit log created: taskId={}, action={}", taskId, actionType);
    }

    public List<TaskAuditLog> getHistory(UUID taskId) {
        return auditLogRepository.findByTaskIdOrderByTimestampAsc(taskId);
    }

    public boolean verifyIntegrity(UUID taskId) {
        List<TaskAuditLog> logs = auditLogRepository.findByTaskIdOrderByTimestampAsc(taskId);

        if (logs.isEmpty()) {
            return true;
        }

        for (int i = 0; i < logs.size(); i++) {
            TaskAuditLog log = logs.get(i);

            // Verify previous hash chain
            String expectedPreviousHash = (i == 0) ? GENESIS_HASH : logs.get(i - 1).getCurrentHash();
            if (!expectedPreviousHash.equals(log.getPreviousHash())) {
                logger.warn("Integrity violation: previousHash mismatch at index {} for taskId={}", i, taskId);
                return false;
            }

            // Verify current hash
            String expectedCurrentHash = sha256(log.getPayloadHash() + log.getPreviousHash());
            if (!expectedCurrentHash.equals(log.getCurrentHash())) {
                logger.warn("Integrity violation: currentHash mismatch at index {} for taskId={}", i, taskId);
                return false;
            }
        }

        return true;
    }

    public static String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }
}
