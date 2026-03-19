package com.craftai.service;

import com.craftai.entity.AdminTemplate;
import com.craftai.repository.AdminTemplateRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;

@Service
public class TemplateService {

    private final S3StorageService s3StorageService;
    private final AdminTemplateRepository adminTemplateRepository;

    public TemplateService(S3StorageService s3StorageService, AdminTemplateRepository adminTemplateRepository) {
        this.s3StorageService = s3StorageService;
        this.adminTemplateRepository = adminTemplateRepository;
    }

    public AdminTemplate saveTemplate(String adminId, String templateName, MultipartFile imageFile) throws IOException {
        String imageUrl = s3StorageService.uploadFile(imageFile);
        AdminTemplate template = new AdminTemplate();
        template.setAdminId(adminId);
        template.setTemplateName(templateName);
        template.setS3OriginalImageUrl(imageUrl);
        return adminTemplateRepository.save(template);
    }

    public List<AdminTemplate> getTemplatesByAdminId(String adminId) {
        return adminTemplateRepository.findByAdminIdOrderByRegistrationDateDesc(adminId);
    }

    public void deleteTemplate(Long id) {
        adminTemplateRepository.deleteById(id);
    }
}
