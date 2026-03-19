package com.craftai.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "shop_settings")
public class ShopSetting {
    @Id
    private String adminId;

    private String shopName;

    @Column(length = 1000)
    private String description;
    private String contact;
    private String operatingHours;

    public String getAdminId() { return adminId; }
    public void setAdminId(String adminId) { this.adminId = adminId; }
    public String getShopName() { return shopName; }
    public void setShopName(String shopName) { this.shopName = shopName; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getContact() { return contact; }
    public void setContact(String contact) { this.contact = contact; }
    public String getOperatingHours() { return operatingHours; }
    public void setOperatingHours(String operatingHours) { this.operatingHours = operatingHours; }
}
