package com.taskportal.ai;

import com.taskportal.dto.AIGenerateResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Deterministic fallback AI provider used when Gemini is unavailable.
 * Uses keyword matching to determine priority and generates template descriptions.
 */
@Component
public class FallbackAIProvider implements AIProvider {

    private static final Logger logger = LoggerFactory.getLogger(FallbackAIProvider.class);

    private static final Map<String, String> KEYWORD_PRIORITY_MAP = Map.ofEntries(
            Map.entry("presentation", "HIGH"),
            Map.entry("deploy", "HIGH"),
            Map.entry("release", "HIGH"),
            Map.entry("urgent", "HIGH"),
            Map.entry("critical", "HIGH"),
            Map.entry("fix", "HIGH"),
            Map.entry("bug", "HIGH"),
            Map.entry("deadline", "HIGH"),
            Map.entry("client", "HIGH"),
            Map.entry("meeting", "MEDIUM"),
            Map.entry("review", "MEDIUM"),
            Map.entry("update", "MEDIUM"),
            Map.entry("plan", "MEDIUM"),
            Map.entry("design", "MEDIUM"),
            Map.entry("test", "MEDIUM"),
            Map.entry("research", "MEDIUM"),
            Map.entry("documentation", "LOW"),
            Map.entry("cleanup", "LOW"),
            Map.entry("refactor", "LOW"),
            Map.entry("organize", "LOW"),
            Map.entry("archive", "LOW"),
            Map.entry("notes", "LOW")
    );

    private static final Map<String, Integer> KEYWORD_EFFORT_MAP = Map.ofEntries(
            Map.entry("presentation", 4),
            Map.entry("deploy", 3),
            Map.entry("release", 6),
            Map.entry("meeting", 2),
            Map.entry("review", 2),
            Map.entry("documentation", 3),
            Map.entry("design", 5),
            Map.entry("test", 4),
            Map.entry("research", 3),
            Map.entry("fix", 2),
            Map.entry("bug", 3),
            Map.entry("refactor", 4),
            Map.entry("plan", 3)
    );

    @Override
    public boolean isAvailable() {
        return true; // Fallback is always available
    }

    @Override
    public AIGenerateResponse generateTaskDetails(String title) {
        logger.info("Using fallback AI provider for title: '{}'", title);

        String lowerTitle = title.toLowerCase();
        String priority = determinePriority(lowerTitle);
        int effort = determineEffort(lowerTitle);
        String description = generateDescription(title, priority);

        return AIGenerateResponse.builder()
                .description(description)
                .suggestedPriority(priority)
                .estimatedEffortHours(effort)
                .aiGenerated(false)
                .build();
    }

    private String determinePriority(String lowerTitle) {
        for (Map.Entry<String, String> entry : KEYWORD_PRIORITY_MAP.entrySet()) {
            if (lowerTitle.contains(entry.getKey())) {
                return entry.getValue();
            }
        }
        return "MEDIUM";
    }

    private int determineEffort(String lowerTitle) {
        for (Map.Entry<String, Integer> entry : KEYWORD_EFFORT_MAP.entrySet()) {
            if (lowerTitle.contains(entry.getKey())) {
                return entry.getValue();
            }
        }
        return 3; // Default effort
    }

    private String generateDescription(String title, String priority) {
        String urgency = switch (priority) {
            case "HIGH" -> "This is a high-priority task that requires immediate attention. ";
            case "LOW" -> "This is a low-priority task that can be completed when time permits. ";
            default -> "This task should be completed within the normal workflow. ";
        };

        return urgency + "Task '" + title + "' involves planning, execution, and verification. "
                + "Break down the work into manageable subtasks and track progress regularly.";
    }
}
