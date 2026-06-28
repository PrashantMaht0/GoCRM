package com.gocrm.core.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.Instant;

@Entity
@Table(name = "chat_summaries")
public class ChatSummary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "lead_id", nullable = false, unique = true) // One summary per lead handover
    private Long leadId;

    @Column(name = "summary", columnDefinition = "TEXT", nullable = false)
    private String summaryText;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    // Constructors, Getters, and Setters
    public ChatSummary() {}

    public ChatSummary(Long leadId, String summaryText) {
        this.leadId = leadId;
        this.summaryText = summaryText;
    }

    public Long getId() { return id; }
    public Long getLeadId() { return leadId; }
    public String getSummaryText() { return summaryText; }
    public void setSummaryText(String summaryText) { this.summaryText = summaryText; }
    public Instant getCreatedAt() { return createdAt; }
}