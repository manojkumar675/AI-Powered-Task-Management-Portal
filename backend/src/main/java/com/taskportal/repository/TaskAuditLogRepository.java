package com.taskportal.repository;

import com.taskportal.entity.TaskAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TaskAuditLogRepository extends JpaRepository<TaskAuditLog, UUID> {

    List<TaskAuditLog> findByTaskIdOrderByTimestampAsc(UUID taskId);

    Optional<TaskAuditLog> findTopByTaskIdOrderByTimestampDesc(UUID taskId);
}
