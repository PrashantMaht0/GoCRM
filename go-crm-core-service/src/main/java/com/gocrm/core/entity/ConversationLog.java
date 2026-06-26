package com.gocrm.core.entity;

import jakarta.persistence.*;
import java.time.ZonedDateTime;

@Entity
@Table(name = "conversation_logs")
public class ConversationLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "lead_id", nullable = false)
    private Long leadId;

    @Column(name = "sender_user_id")
    private Long senderUserId;

    @Column(name = "wamid", nullable = false, unique = true)
    private String wamid;

    @Column(name = "direction", nullable = false)
    private String direction; 

    @Column(name = "message_body", nullable = false, columnDefinition = "TEXT")
    private String messageBody;

    @Column(name = "created_at")
    private ZonedDateTime createdAt = ZonedDateTime.now();

    // Constructors
    public ConversationLog() {}
    public ConversationLog(Long leadId, Long senderUserId, String wamid, String direction, String messageBody) {
        this.leadId = leadId;
        this.senderUserId = senderUserId;
        this.wamid = wamid;
        this.direction = direction;
        this.messageBody = messageBody;
    }

    // Getters and Setters...
    public Long getId() { return id; }
    public Long getLeadId() { return leadId; }
    public String getWamid() { return wamid; }
    public String getDirection() { return direction; }
    public String getMessageBody() { return messageBody; }
}