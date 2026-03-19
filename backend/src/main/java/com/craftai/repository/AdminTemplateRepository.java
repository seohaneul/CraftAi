package com.craftai.repository;

import com.craftai.entity.AdminTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AdminTemplateRepository extends JpaRepository<AdminTemplate, Long> {
    List<AdminTemplate> findByAdminIdOrderByRegistrationDateDesc(String adminId);
}
