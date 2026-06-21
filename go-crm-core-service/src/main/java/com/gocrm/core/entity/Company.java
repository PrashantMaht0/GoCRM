package com.gocrm.core.entity;

import java.time.ZonedDateTime;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "companies")
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_name", nullable = false)
    private String companyName;

    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;

    @OneToOne(mappedBy = "company", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private WhatsAppConfig whatsAppConfig;

    @Column(name = "company_code", unique = true, nullable = false)
    private String companyCode;

    @Column(name="owner_id", nullable=false)
    private Long ownerId;

    @PrePersist
    protected void onCreate() {
        this.createdAt = ZonedDateTime.now();
    }   

    public WhatsAppConfig getWhatsAppConfig() { return whatsAppConfig; }
    public void setWhatsAppConfig(WhatsAppConfig whatsAppConfig) { this.whatsAppConfig = whatsAppConfig; }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public ZonedDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(ZonedDateTime createdAt) { this.createdAt = createdAt; }
    public String getCompanyCode() { return companyCode; }
    public void setCompanyCode(String companyCode) { this.companyCode = companyCode; }
    public Long getOwnerId(){return ownerId;}
    public void setOwnerId(Long ownerId){this.ownerId=ownerId;}
}