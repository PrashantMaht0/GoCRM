package com.gocrm.core.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.Instant;
import org.hibernate.annotations.JdbcTypeCode; 
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "lead_requirements")
public class LeadRequirement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "lead_id", nullable = false, unique = true)
    private Long leadId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "extracted_data", columnDefinition = "jsonb", nullable = false)
    private String extractedData;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    public LeadRequirement() {}

    public LeadRequirement(Long leadId, String extractedData) {
        this.leadId = leadId;
        this.extractedData = extractedData;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public Long getLeadId() { return leadId; }
    public void setLeadId(Long leadId) { this.leadId = leadId; }
    public String getExtractedData() { return extractedData; }
    public void setExtractedData(String extractedData) { this.extractedData = extractedData; }
    public Instant getUpdatedAt() { return updatedAt; }
}