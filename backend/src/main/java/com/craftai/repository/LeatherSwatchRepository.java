package com.craftai.repository;

import com.craftai.entity.LeatherSwatch;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LeatherSwatchRepository extends JpaRepository<LeatherSwatch, Long> {
    List<LeatherSwatch> findByAdminIdOrderByRegistrationDateDesc(String adminId);
}
