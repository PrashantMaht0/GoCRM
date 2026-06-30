package com.gocrm.core.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "company_bot_settings")
public class CompanyBotSettings {

    
    @Id
    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Column(name = "knowledge_base", columnDefinition = "TEXT")
    private String knowledgeBase;

    @Column(name = "admin_guardrails", columnDefinition = "TEXT")
    private String adminGuardrails;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }

    // Default Constructor
    public CompanyBotSettings() {}

    public CompanyBotSettings(Long companyId, String knowledgeBase, String adminGuardrails) {
        this.companyId = companyId;
        this.knowledgeBase = knowledgeBase;
        this.adminGuardrails = adminGuardrails;
    }

    // Getters and Setters
    public Long getCompanyId() { return companyId; }
    public void setCompanyId(Long companyId) { this.companyId = companyId; }
    public String getKnowledgeBase() { return knowledgeBase; }
    public void setKnowledgeBase(String knowledgeBase) { this.knowledgeBase = knowledgeBase; }
    public String getAdminGuardrails() { return adminGuardrails; }
    public void setAdminGuardrails(String adminGuardrails) { this.adminGuardrails = adminGuardrails; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}