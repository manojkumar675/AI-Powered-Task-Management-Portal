package com.taskportal.service;

import com.taskportal.ai.AIProvider;
import com.taskportal.ai.FallbackAIProvider;
import com.taskportal.ai.GeminiAIProvider;
import com.taskportal.dto.AIGenerateResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AIService {

    private static final Logger logger = LoggerFactory.getLogger(AIService.class);

    private final GeminiAIProvider geminiProvider;
    private final FallbackAIProvider fallbackProvider;

    public AIService(GeminiAIProvider geminiProvider, FallbackAIProvider fallbackProvider) {
        this.geminiProvider = geminiProvider;
        this.fallbackProvider = fallbackProvider;
    }

    public AIGenerateResponse generateTaskDetails(String title) {
        logger.info("AI generation requested for title: '{}' at {}", title, LocalDateTime.now());

        // Try Gemini first if available
        if (geminiProvider.isAvailable()) {
            try {
                AIGenerateResponse response = geminiProvider.generateTaskDetails(title);
                if (response != null) {
                    logger.info("Successfully generated task details using Gemini AI");
                    return response;
                }
                logger.warn("Gemini returned null response, falling back");
            } catch (Exception e) {
                logger.error("Gemini provider failed, falling back: {}", e.getMessage());
            }
        } else {
            logger.info("Gemini API key not configured, using fallback provider");
        }

        // Fallback
        AIGenerateResponse fallbackResponse = fallbackProvider.generateTaskDetails(title);
        logger.info("Generated task details using fallback provider");
        return fallbackResponse;
    }
}
