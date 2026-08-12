package com.taskportal.repository;

import com.taskportal.entity.Priority;
import com.taskportal.entity.Status;
import com.taskportal.entity.Task;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TaskRepository extends JpaRepository<Task, UUID> {

    Page<Task> findByOwnerId(UUID ownerId, Pageable pageable);

    Page<Task> findByOwnerIdAndStatus(UUID ownerId, Status status, Pageable pageable);

    Page<Task> findByOwnerIdAndPriority(UUID ownerId, Priority priority, Pageable pageable);

    Page<Task> findByOwnerIdAndStatusAndPriority(UUID ownerId, Status status, Priority priority, Pageable pageable);

    @Query("SELECT t FROM Task t WHERE t.owner.id = :ownerId AND LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Task> searchByTitle(@Param("ownerId") UUID ownerId, @Param("keyword") String keyword, Pageable pageable);

    Optional<Task> findByIdAndOwnerId(UUID id, UUID ownerId);

    long countByOwnerId(UUID ownerId);

    long countByOwnerIdAndStatus(UUID ownerId, Status status);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.owner.id = :ownerId AND t.status != 'DONE' AND t.dueDate < :today")
    long countOverdueTasks(@Param("ownerId") UUID ownerId, @Param("today") LocalDate today);
}
