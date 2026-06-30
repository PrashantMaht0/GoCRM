package com.gocrm.core.dto;

import com.gocrm.core.entity.Lead;
import java.time.ZonedDateTime;

public class LeadDTO {
    private Long id;
    private String customerName;
    private String whatsappId;
    private String pipelineStatus;
    private boolean botMode;
    private Double contractValue;
    private Double lifetimeValue;
    private ZonedDateTime createdAt;
    private String aiSummary;

    public LeadDTO(Lead lead, String aiSummary) {
        this.id = lead.getId();
        this.customerName = lead.getCustomerName();
        this.whatsappId = lead.getWhatsappId();
        this.pipelineStatus = lead.getPipelineStatus();
        this.botMode = lead.isBotMode();
        this.contractValue = lead.getContractValue();
        this.lifetimeValue = lead.getLifetimeValue();
        this.createdAt = lead.getCreatedAt();
        this.aiSummary = aiSummary;
    }

    // Getters
    public Long getId() { return id; }
    public String getCustomerName() { return customerName; }
    public String getWhatsappId() { return whatsappId; }
    public String getPipelineStatus() { return pipelineStatus; }
    public boolean isBotMode() { return botMode; }
    public Double getContractValue() { return contractValue; }
    public Double getLifetimeValue() { return lifetimeValue; }
    public ZonedDateTime getCreatedAt() { return createdAt; }
    public String getAiSummary() { return aiSummary; }
}