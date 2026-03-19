package com.craftai.controller;

import com.craftai.service.AiProcessingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    private final AiProcessingService aiProcessingService;

    public OrderController(AiProcessingService aiProcessingService) {
        this.aiProcessingService = aiProcessingService;
    }

    @PostMapping("/visualize")
    public ResponseEntity<?> visualize(
            @RequestParam("leatherImage") MultipartFile leatherImage,
            @RequestParam("templateImageUrl") String templateImageUrl) {
        try {
            // 전달받은 가죽 파일을 AI 서비스로 넘겨 처리
            String resultUrl = aiProcessingService.requestSynthesis(leatherImage, templateImageUrl);
            return ResponseEntity.ok(Map.of("result_image_url", resultUrl));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error visualizing: " + e.getMessage());
        }
    }
}
