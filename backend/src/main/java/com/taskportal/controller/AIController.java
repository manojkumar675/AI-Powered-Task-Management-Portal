package com.taskportal.controller;

import com.taskportal.dto.AIGenerateRequest;
import com.taskportal.dto.AIGenerateResponse;
import com.taskportal.service.AIService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@Tag(name = "AI", description = "AI-powered task detail generation")
public class AIController {

    private final AIService aiService;

    public AIController(AIService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/generate-task-details")
    @Operation(summary = "Generate task description, priority, and effort using AI")
    public ResponseEntity<AIGenerateResponse> generateTaskDetails(
            @Valid @RequestBody AIGenerateRequest request) {
        AIGenerateResponse response = aiService.generateTaskDetails(request.getTitle());
        return ResponseEntity.ok(response);
    }
}
