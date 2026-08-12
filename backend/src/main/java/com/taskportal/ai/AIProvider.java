package com.taskportal.ai;

import com.taskportal.dto.AIGenerateResponse;

/**
 * Pluggable AI service interface for task detail generation.
 */
public interface AIProvider {

    /**
     * Generate task details (description, priority, estimated effort) from a task title.
     *
     * @param title the task title
     * @return generated task details
     */
    AIGenerateResponse generateTaskDetails(String title);

    /**
     * Check if this provider is available and configured.
     */
    boolean isAvailable();
}
