package com.craftai.controller;

import com.craftai.service.AiProcessingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    private final AiProcessingService aiProcessingService;

    public OrderController(AiProcessingService aiProcessingService) {
        this.aiProcessingService = aiProcessingService;
    }

    @PostMapping("/visualize")
    public ResponseEntity<String> requestVisualization(@RequestBody VisualizationRequest request) {
        // 클라이언트 요청을 받아 서비스 계층으로 전달
        String aiResponse = aiProcessingService.requestImageSynthesis(request.getImageUrl(), request.getPrompt());
        return ResponseEntity.ok(aiResponse);
    }
}

class VisualizationRequest {
    private String imageUrl;
    private String prompt;

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getPrompt() { return prompt; }
    public void setPrompt(String prompt) { this.prompt = prompt; }
}
