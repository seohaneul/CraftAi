package com.craftai.controller;

import com.craftai.entity.AdminTemplate;
import com.craftai.service.TemplateService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/templates")
@CrossOrigin(origins = "*") // 프론트엔드 테스트를 위한 CORS 허용
public class TemplateController {

    private final TemplateService templateService;

    public TemplateController(TemplateService templateService) {
        this.templateService = templateService;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadTemplate(
            @RequestParam("adminId") String adminId,
            @RequestParam("templateName") String templateName,
            @RequestParam("image") MultipartFile image) {
        try {
            // S3 URL이 포함된 AdminTemplate 엔티티 저장 후 결과 반환
            AdminTemplate savedTemplate = templateService.saveTemplate(adminId, templateName, image);
            return ResponseEntity.ok(savedTemplate);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error uploading template: " + e.getMessage());
        }
    }
}
