package com.gocrm.core.entity;

import jakarta.persistence.*;
import java.time.ZonedDateTime;

import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "leads")
public class Lead {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Column(name = "assigned_user_id")
    private Long assignedUserId;

    @Column(name = "whatsapp_id", nullable = false)
    private String whatsappId;

    @Column(name = "customer_name")
    private String customerName;

    @Column(name = "pipeline_status", nullable = false)
    private String pipelineStatus = "NEW";

    @Column(name = "bot_mode", nullable = false)
    private boolean botMode = true; 

    @Column(name = "contract_value")
    private Double contractValue;

    @Column(name = "lifetime_value")
    private Double lifetimeValue;

    @CreationTimestamp
    @Column(name = "created_at",updatable = false)
    private ZonedDateTime createdAt = ZonedDateTime.now();

    // Getters and Setters...
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getCompanyId() { return companyId; }
    public void setCompanyId(Long companyId) { this.companyId = companyId; }
    public Long getAssignedUserId() { return assignedUserId; }
    public void setAssignedUserId(Long assignedUserId) { this.assignedUserId = assignedUserId; }
    public String getWhatsappId() { return whatsappId; }
    public void setWhatsappId(String whatsappId) { this.whatsappId = whatsappId; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getPipelineStatus() { return pipelineStatus; }
    public void setPipelineStatus(String pipelineStatus) { this.pipelineStatus = pipelineStatus; }
    public boolean isBotMode() { return botMode; }
    public void setBotMode(boolean botMode) { this.botMode = botMode; }
    public Double getContractValue() { return contractValue; }
    public void setContractValue(Double contractValue) { this.contractValue = contractValue; }
    public Double getLifetimeValue() { return lifetimeValue; }
    public void setLifetimeValue(Double lifetimeValue) { this.lifetimeValue = lifetimeValue; }
    public ZonedDateTime getCreatedAt() { return createdAt; }
}