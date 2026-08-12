package com.taskportal.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskportal.dto.AIGenerateResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;

@Component
public class GeminiAIProvider implements AIProvider {

    private static final Logger logger = LoggerFactory.getLogger(GeminiAIProvider.class);

    private final String apiKey;
    private final String apiUrl;
    private final int timeoutMs;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    public GeminiAIProvider(
            @Value("${app.gemini.api-key}") String apiKey,
            @Value("${app.gemini.api-url}") String apiUrl,
            @Value("${app.gemini.timeout-ms}") int timeoutMs) {
        this.apiKey = apiKey;
        this.apiUrl = apiUrl;
        this.timeoutMs = timeoutMs;
        this.objectMapper = new ObjectMapper();
        this.restTemplate = new RestTemplate();
    }

    @Override
    public boolean isAvailable() {
        return StringUtils.hasText(apiKey) && !apiKey.equals("your-gemini-api-key");
    }

    @Override
    public AIGenerateResponse generateTaskDetails(String title) {
        logger.info("Generating task details for title: '{}' at {}", title, LocalDateTime.now());

        String prompt = buildPrompt(title);
        String requestBody = buildRequestBody(prompt);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            String url = apiUrl + "?key=" + apiKey;
            HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.POST, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                logger.info("RAW GEMINI RESPONSE: {}", response.getBody());
                return parseGeminiResponse(response.getBody());
            }

            logger.warn("Gemini API returned non-success status: {}", response.getStatusCode());
            return null;
        } catch (Exception e) {
            logger.error("Error calling Gemini API: {}", e.getMessage());
            return null;
        }
    }

    private String buildPrompt(String title) {
        return "You are a task management assistant. Given a task title, generate task details. "
                + "Respond with ONLY a valid JSON object (no markdown, no code blocks) with these exact fields:\n"
                + "{\n"
                + "  \"description\": \"A detailed 2-3 sentence task description\",\n"
                + "  \"suggestedPriority\": \"HIGH or MEDIUM or LOW\",\n"
                + "  \"estimatedEffortHours\": <integer between 1 and 40>\n"
                + "}\n\n"
                + "Task title: \"" + title + "\"";
    }

    private String buildRequestBody(String prompt) {
        return "{"
                + "\"contents\":[{\"parts\":[{\"text\":\"" + escapeJson(prompt) + "\"}]}],"
                + "\"generationConfig\":{\"temperature\":0.7,\"maxOutputTokens\":5000}"
                + "}";
    }

    private AIGenerateResponse parseGeminiResponse(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode candidates = root.path("candidates");

            if (candidates.isArray() && !candidates.isEmpty()) {
                JsonNode parts = candidates.get(0).path("content").path("parts");
                String text = "";
                
                // Iterate through parts to find the text part (handling thinking models)
                if (parts.isArray()) {
                    for (JsonNode part : parts) {
                        if (part.has("text")) {
                            text = part.path("text").asText();
                            break;
                        }
                    }
                }

                // Remove potential markdown code block markers
                text = text.replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();
                
                logger.info("Cleaned Gemini text to parse: {}", text);

                JsonNode parsed = objectMapper.readTree(text);

                String description = parsed.path("description").asText("");
                String priority = parsed.path("suggestedPriority").asText("MEDIUM").toUpperCase();
                int effort = parsed.path("estimatedEffortHours").asInt(4);

                // Validate priority
                if (!priority.equals("HIGH") && !priority.equals("MEDIUM") && !priority.equals("LOW")) {
                    priority = "MEDIUM";
                }

                // Validate effort
                if (effort < 1) effort = 1;
                if (effort > 40) effort = 40;

                return AIGenerateResponse.builder()
                        .description(description)
                        .suggestedPriority(priority)
                        .estimatedEffortHours(effort)
                        .aiGenerated(true)
                        .build();
            }

            logger.warn("No candidates in Gemini response");
            return null;
        } catch (Exception e) {
            logger.error("Failed to parse Gemini response: {}", e.getMessage());
            return null;
        }
    }

    private String escapeJson(String text) {
        return text.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }
}
