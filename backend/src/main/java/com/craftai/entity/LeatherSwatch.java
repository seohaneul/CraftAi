package com.craftai.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "leather_swatches")
public class LeatherSwatch {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String adminId;

    @Column(nullable = false)
    private String leatherName;

    @Column(nullable = false)
    private String color;

    @Column(nullable = false)
    private String textureType;

    @Column(nullable = false)
    private String s3SwatchImageUrl;

    @Column(nullable = false, updatable = false)
    private LocalDateTime registrationDate;

    @PrePersist
    protected void onCreate() { this.registrationDate = LocalDateTime.now(); }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getAdminId() { return adminId; }
    public void setAdminId(String adminId) { this.adminId = adminId; }
    public String getLeatherName() { return leatherName; }
    public void setLeatherName(String leatherName) { this.leatherName = leatherName; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    public String getTextureType() { return textureType; }
    public void setTextureType(String textureType) { this.textureType = textureType; }
    public String getS3SwatchImageUrl() { return s3SwatchImageUrl; }
    public void setS3SwatchImageUrl(String s3SwatchImageUrl) { this.s3SwatchImageUrl = s3SwatchImageUrl; }
    public LocalDateTime getRegistrationDate() { return registrationDate; }
    public void setRegistrationDate(LocalDateTime registrationDate) { this.registrationDate = registrationDate; }
}
