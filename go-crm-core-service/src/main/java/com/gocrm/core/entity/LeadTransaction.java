package com.gocrm.core.entity;

import jakarta.persistence.*;
import java.time.ZonedDateTime;

import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "lead_transactions")
public class LeadTransaction {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long leadId;
    private Long companyId;
    private Long assignedUserId; // Who won the deal?
    private Double amount;
    @CreationTimestamp
    private ZonedDateTime closedAt; // When was it won?
    
    // ... getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getLeadId() { return leadId; }
    public void setLeadId(Long leadId) { this.leadId = leadId; }
    public Long getCompanyId() { return companyId; }
    public void setCompanyId(Long companyId) { this.companyId = companyId; }
    public Long getAssignedUserId() { return assignedUserId; }
    public void setAssignedUserId(Long assignedUserId) { this.assignedUserId = assignedUserId; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    public ZonedDateTime getClosedAt() { return closedAt; }
    public void setClosedAt(ZonedDateTime closedAt) { this.closedAt = closedAt; }
}