package com.craftai.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import java.util.Map;

@Service
public class AiProcessingService {

    @Value("${ai.server.url}")
    private String aiServerUrl;

    public String requestImageSynthesis(String imageUrl, String prompt) {
        // AI 서버로 요청 전달 뼈대
        RestTemplate restTemplate = new RestTemplate();
        String endpoint = aiServerUrl + "/api/v1/synthesize";
        
        Map<String, String> payload = Map.of(
            "image_url", imageUrl,
            "prompt", prompt
        );

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(endpoint, payload, String.class);
            return response.getBody();
        } catch (Exception e) {
            return "{\"error\": \"Failed to connect to AI server\"}";
        }
    }
}
