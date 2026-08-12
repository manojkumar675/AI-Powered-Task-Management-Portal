package com.taskportal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIGenerateResponse {
    private String description;
    private String suggestedPriority;
    private int estimatedEffortHours;
    private boolean aiGenerated;
}
