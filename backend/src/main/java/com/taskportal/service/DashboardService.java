package com.taskportal.service;

import com.taskportal.dto.DashboardStats;
import com.taskportal.entity.Status;
import com.taskportal.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.UUID;

@Service
public class DashboardService {

    private final TaskRepository taskRepository;

    public DashboardService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public DashboardStats getStats(UUID ownerId) {
        long totalTasks = taskRepository.countByOwnerId(ownerId);
        long completedTasks = taskRepository.countByOwnerIdAndStatus(ownerId, Status.DONE);
        long inProgressTasks = taskRepository.countByOwnerIdAndStatus(ownerId, Status.IN_PROGRESS);
        long pendingTasks = taskRepository.countByOwnerIdAndStatus(ownerId, Status.TODO);
        long overdueTasks = taskRepository.countOverdueTasks(ownerId, LocalDate.now());

        return DashboardStats.builder()
                .totalTasks(totalTasks)
                .completedTasks(completedTasks)
                .pendingTasks(pendingTasks)
                .inProgressTasks(inProgressTasks)
                .overdueTasks(overdueTasks)
                .build();
    }
}
