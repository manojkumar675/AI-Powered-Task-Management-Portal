package com.taskportal.service;

import com.taskportal.dto.StatusUpdateRequest;
import com.taskportal.dto.TaskRequest;
import com.taskportal.dto.TaskResponse;
import com.taskportal.entity.Priority;
import com.taskportal.entity.Status;
import com.taskportal.entity.Task;
import com.taskportal.entity.User;
import com.taskportal.exception.ResourceNotFoundException;
import com.taskportal.repository.TaskRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final TaskAuditLogService auditLogService;

    public TaskService(TaskRepository taskRepository, TaskAuditLogService auditLogService) {
        this.taskRepository = taskRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public TaskResponse createTask(TaskRequest request, User owner) {
        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority())
                .dueDate(request.getDueDate())
                .status(request.getStatus() != null ? request.getStatus() : Status.TODO)
                .estimatedTimeHours(request.getEstimatedTimeHours())
                .createdBy(owner.getEmail())
                .owner(owner)
                .build();

        Task saved = taskRepository.save(task);
        auditLogService.logAction(saved.getId(), "TASK_CREATED", saved.toString());
        return mapToResponse(saved);
    }

    public Page<TaskResponse> getTasks(UUID ownerId, Status status, Priority priority, Pageable pageable) {
        Page<Task> tasks;

        if (status != null && priority != null) {
            tasks = taskRepository.findByOwnerIdAndStatusAndPriority(ownerId, status, priority, pageable);
        } else if (status != null) {
            tasks = taskRepository.findByOwnerIdAndStatus(ownerId, status, pageable);
        } else if (priority != null) {
            tasks = taskRepository.findByOwnerIdAndPriority(ownerId, priority, pageable);
        } else {
            tasks = taskRepository.findByOwnerId(ownerId, pageable);
        }

        return tasks.map(this::mapToResponse);
    }

    public TaskResponse getTaskById(UUID taskId, UUID ownerId) {
        Task task = taskRepository.findByIdAndOwnerId(taskId, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));
        return mapToResponse(task);
    }

    @Transactional
    public TaskResponse updateTask(UUID taskId, TaskRequest request, User owner) {
        Task task = taskRepository.findByIdAndOwnerId(taskId, owner.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setPriority(request.getPriority());
        task.setDueDate(request.getDueDate());
        task.setEstimatedTimeHours(request.getEstimatedTimeHours());
        if (request.getStatus() != null) {
            task.setStatus(request.getStatus());
        }

        Task saved = taskRepository.save(task);
        auditLogService.logAction(saved.getId(), "TASK_UPDATED", saved.toString());
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteTask(UUID taskId, UUID ownerId) {
        Task task = taskRepository.findByIdAndOwnerId(taskId, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));
        auditLogService.logAction(task.getId(), "TASK_DELETED", task.toString());
        taskRepository.delete(task);
    }

    @Transactional
    public TaskResponse updateStatus(UUID taskId, StatusUpdateRequest request, User owner) {
        Task task = taskRepository.findByIdAndOwnerId(taskId, owner.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));

        Status oldStatus = task.getStatus();
        task.setStatus(request.getStatus());
        Task saved = taskRepository.save(task);

        String actionType = request.getStatus() == Status.DONE ? "TASK_COMPLETED" : "STATUS_CHANGED";
        auditLogService.logAction(saved.getId(), actionType,
                "Status changed from " + oldStatus + " to " + request.getStatus());

        return mapToResponse(saved);
    }

    public Page<TaskResponse> searchTasks(UUID ownerId, String keyword, Pageable pageable) {
        return taskRepository.searchByTitle(ownerId, keyword, pageable)
                .map(this::mapToResponse);
    }

    private TaskResponse mapToResponse(Task task) {
        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .priority(task.getPriority())
                .dueDate(task.getDueDate())
                .status(task.getStatus())
                .estimatedTimeHours(task.getEstimatedTimeHours())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .createdBy(task.getCreatedBy())
                .ownerName(task.getOwner().getName())
                .ownerEmail(task.getOwner().getEmail())
                .build();
    }
}
