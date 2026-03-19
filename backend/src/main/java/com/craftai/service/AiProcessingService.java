package com.craftai.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;
import java.util.HashMap;
import java.util.Map;
import java.io.IOException;

@Service
public class AiProcessingService {

    @Value("${NEXT_PUBLIC_AI_API_URL:http://localhost:8000}")
    private String aiApiUrl;

    private final S3StorageService s3StorageService;
    private final RestTemplate restTemplate;

    public AiProcessingService(S3StorageService s3StorageService, RestTemplate restTemplate) {
        this.s3StorageService = s3StorageService;
        this.restTemplate = restTemplate;
    }

    public String requestSynthesis(MultipartFile leatherImage, String templateImageUrl) throws IOException {
        // 1. 고객이 올린 가죽 사진을 S3에 업로드
        String leatherImageUrl = s3StorageService.uploadFile(leatherImage);

        // 2. 파이썬 FastAPI 서버로 두 URL을 보내서 합성 지시
        String aiServerUrl = aiApiUrl + "/api/v1/synthesize";
        Map<String, String> request = new HashMap<>();
        request.put("leather_url", leatherImageUrl);
        request.put("template_url", templateImageUrl);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(aiServerUrl, request, Map.class);
            if (response.getBody() != null && response.getBody().containsKey("result_image_url")) {
                return (String) response.getBody().get("result_image_url");
            }
        } catch (Exception e) {
            throw new IOException("AI Server Error: " + e.getMessage());
        }
        
        throw new IOException("Failed to get response from AI server");
    }
}
