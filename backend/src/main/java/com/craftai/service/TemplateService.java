package com.craftai.service;

import com.craftai.entity.AdminTemplate;
import com.craftai.repository.AdminTemplateRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

@Service
public class TemplateService {

    private final S3StorageService s3StorageService;
    private final AdminTemplateRepository adminTemplateRepository;

    public TemplateService(S3StorageService s3StorageService, AdminTemplateRepository adminTemplateRepository) {
        this.s3StorageService = s3StorageService;
        this.adminTemplateRepository = adminTemplateRepository;
    }

    public AdminTemplate saveTemplate(String adminId, String templateName, MultipartFile imageFile) throws IOException {
        // 1. S3에 이미지 업로드하고 URL 획득
        String imageUrl = s3StorageService.uploadFile(imageFile);

        // 2. 관리자 템플릿 엔티티 생성 및 데이터베이스 저장
        AdminTemplate template = new AdminTemplate();
        template.setAdminId(adminId);
        template.setTemplateName(templateName);
        template.setS3OriginalImageUrl(imageUrl);

        return adminTemplateRepository.save(template);
    }
}
