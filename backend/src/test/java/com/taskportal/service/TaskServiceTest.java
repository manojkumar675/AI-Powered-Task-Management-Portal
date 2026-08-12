package com.taskportal.service;

import com.taskportal.dto.StatusUpdateRequest;
import com.taskportal.dto.TaskRequest;
import com.taskportal.dto.TaskResponse;
import com.taskportal.entity.*;
import com.taskportal.exception.ResourceNotFoundException;
import com.taskportal.repository.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private TaskAuditLogService auditLogService;

    @InjectMocks
    private TaskService taskService;

    private User testUser;
    private Task testTask;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(UUID.randomUUID())
                .name("Test User")
                .email("test@example.com")
                .role(Role.USER)
                .build();

        testTask = Task.builder()
                .id(UUID.randomUUID())
                .title("Test Task")
                .description("Test Description")
                .priority(Priority.MEDIUM)
                .status(Status.TODO)
                .dueDate(LocalDate.now().plusDays(7))
                .estimatedTimeHours(3)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .createdBy("test@example.com")
                .owner(testUser)
                .build();
    }

    @Test
    void createTask_ShouldSaveAndReturnTask() {
        TaskRequest request = new TaskRequest("New Task", "Description", Priority.HIGH,
                LocalDate.now().plusDays(5), null, 4);

        when(taskRepository.save(any(Task.class))).thenReturn(testTask);

        TaskResponse response = taskService.createTask(request, testUser);

        assertThat(response).isNotNull();
        assertThat(response.getTitle()).isEqualTo("Test Task");
        verify(taskRepository).save(any(Task.class));
        verify(auditLogService).logAction(any(UUID.class), eq("TASK_CREATED"), anyString());
    }

    @Test
    void getTasks_ShouldReturnPagedResults() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Task> page = new PageImpl<>(List.of(testTask));
        when(taskRepository.findByOwnerId(testUser.getId(), pageable)).thenReturn(page);

        Page<TaskResponse> result = taskService.getTasks(testUser.getId(), null, null, pageable);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getTitle()).isEqualTo("Test Task");
    }

    @Test
    void getTaskById_ShouldReturnTask() {
        when(taskRepository.findByIdAndOwnerId(testTask.getId(), testUser.getId()))
                .thenReturn(Optional.of(testTask));

        TaskResponse response = taskService.getTaskById(testTask.getId(), testUser.getId());

        assertThat(response.getTitle()).isEqualTo("Test Task");
    }

    @Test
    void getTaskById_ShouldThrowWhenNotFound() {
        UUID randomId = UUID.randomUUID();
        when(taskRepository.findByIdAndOwnerId(randomId, testUser.getId()))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> taskService.getTaskById(randomId, testUser.getId()))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void updateTask_ShouldUpdateAndReturn() {
        TaskRequest request = new TaskRequest("Updated", "Updated desc", Priority.HIGH,
                LocalDate.now().plusDays(10), Status.IN_PROGRESS, 5);

        when(taskRepository.findByIdAndOwnerId(testTask.getId(), testUser.getId()))
                .thenReturn(Optional.of(testTask));
        when(taskRepository.save(any(Task.class))).thenReturn(testTask);

        TaskResponse response = taskService.updateTask(testTask.getId(), request, testUser);

        assertThat(response).isNotNull();
        verify(auditLogService).logAction(any(UUID.class), eq("TASK_UPDATED"), anyString());
    }

    @Test
    void deleteTask_ShouldDeleteTask() {
        when(taskRepository.findByIdAndOwnerId(testTask.getId(), testUser.getId()))
                .thenReturn(Optional.of(testTask));

        taskService.deleteTask(testTask.getId(), testUser.getId());

        verify(taskRepository).delete(testTask);
        verify(auditLogService).logAction(any(UUID.class), eq("TASK_DELETED"), anyString());
    }

    @Test
    void updateStatus_ShouldUpdateStatusAndAudit() {
        StatusUpdateRequest request = new StatusUpdateRequest(Status.DONE);

        when(taskRepository.findByIdAndOwnerId(testTask.getId(), testUser.getId()))
                .thenReturn(Optional.of(testTask));
        when(taskRepository.save(any(Task.class))).thenReturn(testTask);

        TaskResponse response = taskService.updateStatus(testTask.getId(), request, testUser);

        assertThat(response).isNotNull();
        verify(auditLogService).logAction(any(UUID.class), eq("TASK_COMPLETED"), anyString());
    }
}
