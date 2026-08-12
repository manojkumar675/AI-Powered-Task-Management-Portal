package com.taskportal.service;

import com.taskportal.ai.FallbackAIProvider;
import com.taskportal.ai.GeminiAIProvider;
import com.taskportal.dto.AIGenerateResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AIServiceTest {

    @Mock
    private GeminiAIProvider geminiProvider;

    @Mock
    private FallbackAIProvider fallbackProvider;

    @InjectMocks
    private AIService aiService;

    @Test
    void shouldUseGeminiWhenAvailable() {
        AIGenerateResponse geminiResponse = AIGenerateResponse.builder()
                .description("AI generated description")
                .suggestedPriority("HIGH")
                .estimatedEffortHours(4)
                .aiGenerated(true)
                .build();

        when(geminiProvider.isAvailable()).thenReturn(true);
        when(geminiProvider.generateTaskDetails(anyString())).thenReturn(geminiResponse);

        AIGenerateResponse result = aiService.generateTaskDetails("Test task");

        assertThat(result.isAiGenerated()).isTrue();
        assertThat(result.getDescription()).isEqualTo("AI generated description");
        verify(fallbackProvider, never()).generateTaskDetails(anyString());
    }

    @Test
    void shouldFallbackWhenGeminiUnavailable() {
        AIGenerateResponse fallbackResponse = AIGenerateResponse.builder()
                .description("Fallback description")
                .suggestedPriority("MEDIUM")
                .estimatedEffortHours(3)
                .aiGenerated(false)
                .build();

        when(geminiProvider.isAvailable()).thenReturn(false);
        when(fallbackProvider.generateTaskDetails(anyString())).thenReturn(fallbackResponse);

        AIGenerateResponse result = aiService.generateTaskDetails("Test task");

        assertThat(result.isAiGenerated()).isFalse();
        verify(geminiProvider, never()).generateTaskDetails(anyString());
    }

    @Test
    void shouldFallbackWhenGeminiThrows() {
        AIGenerateResponse fallbackResponse = AIGenerateResponse.builder()
                .description("Fallback description")
                .suggestedPriority("MEDIUM")
                .estimatedEffortHours(3)
                .aiGenerated(false)
                .build();

        when(geminiProvider.isAvailable()).thenReturn(true);
        when(geminiProvider.generateTaskDetails(anyString())).thenThrow(new RuntimeException("API error"));
        when(fallbackProvider.generateTaskDetails(anyString())).thenReturn(fallbackResponse);

        AIGenerateResponse result = aiService.generateTaskDetails("Test task");

        assertThat(result.isAiGenerated()).isFalse();
    }

    @Test
    void shouldFallbackWhenGeminiReturnsNull() {
        AIGenerateResponse fallbackResponse = AIGenerateResponse.builder()
                .description("Fallback description")
                .suggestedPriority("HIGH")
                .estimatedEffortHours(4)
                .aiGenerated(false)
                .build();

        when(geminiProvider.isAvailable()).thenReturn(true);
        when(geminiProvider.generateTaskDetails(anyString())).thenReturn(null);
        when(fallbackProvider.generateTaskDetails(anyString())).thenReturn(fallbackResponse);

        AIGenerateResponse result = aiService.generateTaskDetails("Prepare presentation");

        assertThat(result.isAiGenerated()).isFalse();
        assertThat(result.getSuggestedPriority()).isEqualTo("HIGH");
    }
}
