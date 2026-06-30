package com.gocrm.core.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.ZonedDateTime;

@Entity
@Table(name = "ticket_resolutions")
public class TicketResolution {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ticket_id", nullable = false)
    private Long ticketId;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Column(name = "resolved_by_user_id", nullable = false)
    private Long resolvedByUserId;

    @Column(name = "issue_description", columnDefinition = "text")
    private String issueDescription;

    @CreationTimestamp
    @Column(name = "resolved_at")
    private ZonedDateTime resolvedAt;

    public TicketResolution() {}

    public TicketResolution(Long ticketId, Long companyId, Long resolvedByUserId, String issueDescription) {
        this.ticketId = ticketId;
        this.companyId = companyId;
        this.resolvedByUserId = resolvedByUserId;
        this.issueDescription = issueDescription;
    }

    // Getters
    public Long getId() { return id; }
    public Long getTicketId() { return ticketId; }
    public Long getCompanyId() { return companyId; }
    public Long getResolvedByUserId() { return resolvedByUserId; }
    public String getIssueDescription() { return issueDescription; }
    public ZonedDateTime getResolvedAt() { return resolvedAt; }
}