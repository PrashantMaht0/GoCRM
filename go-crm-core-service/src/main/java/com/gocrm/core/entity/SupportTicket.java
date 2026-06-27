package com.gocrm.core.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.Instant;

@Entity
@Table(name = "support_tickets")
public class SupportTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Column(name = "lead_id", nullable = false)
    private Long leadId;

    @Column(name = "assigned_user_id")
    private Long assignedUserId;

    @Column(name = "ticket_status", nullable = false)
    private String ticketStatus; // e.g., "OPEN", "CLOSED"

    @Column(name = "issue_description", columnDefinition = "TEXT", nullable = false)
    private String issueDescription;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    // Default Constructor
    public SupportTicket() {}

    // Getters and Setters omitted for brevity...
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getCompanyId() { return companyId; }
    public void setCompanyId(Long companyId) { this.companyId = companyId; }
    public Long getLeadId() { return leadId; }
    public void setLeadId(Long leadId) { this.leadId = leadId; }
    public Long getAssignedUserId() { return assignedUserId; }
    public void setAssignedUserId(Long assignedUserId) { this.assignedUserId = assignedUserId; }
    public String getTicketStatus() { return ticketStatus; }
    public void setTicketStatus(String ticketStatus) { this.ticketStatus = ticketStatus; }
    public String getIssueDescription() { return issueDescription; }
    public void setIssueDescription(String issueDescription) { this.issueDescription = issueDescription; }
    public Instant getCreatedAt() { return createdAt; } 
}