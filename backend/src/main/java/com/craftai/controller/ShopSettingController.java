package com.craftai.controller;

import com.craftai.entity.ShopSetting;
import com.craftai.repository.ShopSettingRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/settings")
@CrossOrigin(origins = "*")
public class ShopSettingController {

    private final ShopSettingRepository shopSettingRepository;

    public ShopSettingController(ShopSettingRepository shopSettingRepository) {
        this.shopSettingRepository = shopSettingRepository;
    }

    @GetMapping("/{adminId}")
    public ResponseEntity<ShopSetting> getSettings(@PathVariable String adminId) {
        return shopSettingRepository.findById(adminId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.ok(new ShopSetting())); 
    }

    @PostMapping("/{adminId}")
    public ResponseEntity<ShopSetting> updateSettings(@PathVariable String adminId, @RequestBody ShopSetting setting) {
        setting.setAdminId(adminId);
        return ResponseEntity.ok(shopSettingRepository.save(setting));
    }
}
