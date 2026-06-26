package com.gocrm.core.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.gocrm.core.entity.ConversationLog;
import com.gocrm.core.entity.Lead;
import com.gocrm.core.repository.ConversationLogRepository;
import com.gocrm.core.repository.LeadRepository;
import com.gocrm.core.repository.WhatsAppConfigRepository;
import org.springframework.http.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/chats")
@CrossOrigin(origins = "*")
public class ChatController {

    private final ConversationLogRepository conversationLogRepository;
    private final LeadRepository leadRepository;
    private final WhatsAppConfigRepository waConfigRepository;
    private final SimpMessagingTemplate messagingTemplate; // The WebSocket Broadcaster

    public ChatController(ConversationLogRepository conversationLogRepository,
                          LeadRepository leadRepository,
                          WhatsAppConfigRepository waConfigRepository,
                          SimpMessagingTemplate messagingTemplate) {
        this.conversationLogRepository = conversationLogRepository;
        this.leadRepository = leadRepository;
        this.waConfigRepository = waConfigRepository;
        this.messagingTemplate = messagingTemplate;
    }

    // 1. Fetch the full history when a user clicks on a lead
    @GetMapping("/{leadId}")
    public ResponseEntity<List<ConversationLog>> getChatHistory(@PathVariable Long leadId) {
        List<ConversationLog> history = conversationLogRepository.findByLeadIdOrderByCreatedAtAsc(leadId);
        return ResponseEntity.ok(history);
    }

    // 2. Handle a manual message sent by the Sales Rep
    @PostMapping("/{leadId}/send")
    public ResponseEntity<?> sendManualMessage(@PathVariable Long leadId, @RequestBody Map<String, String> payload) {
        String messageBody = payload.get("message");
        if (messageBody == null || messageBody.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Message cannot be empty");
        }

        Lead lead = leadRepository.findById(leadId)
                .orElseThrow(() -> new RuntimeException("Lead not found"));

        String accessToken = waConfigRepository.findByCompanyId(lead.getCompanyId())
                .orElseThrow(() -> new RuntimeException("WhatsApp config missing"))
                .getAccessToken();
                
        String phoneNumberId = waConfigRepository.findByCompanyId(lead.getCompanyId()).get().getPhoneNumberId();

        // 1. Send to Meta Graph API
        String wamid = sendToMetaApi(lead.getWhatsappId(), messageBody, phoneNumberId, accessToken);

        // 2. Save to Database
        ConversationLog savedLog = new ConversationLog(
                lead.getId(),
                lead.getAssignedUserId(), 
                wamid,
                "OUTBOUND",
                messageBody
        );
        conversationLogRepository.save(savedLog);

        // 3. Broadcast the new message via WebSocket to any connected React client
        messagingTemplate.convertAndSend("/topic/chat/" + leadId, savedLog);

        return ResponseEntity.ok(savedLog);
    }

    // Helper method to execute the Meta API call
    private String sendToMetaApi(String toPhone, String textBody, String phoneNumberId, String accessToken) {
        RestTemplate restTemplate = new RestTemplate();
        String url = "https://graph.facebook.com/v20.0/" + phoneNumberId + "/messages";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(accessToken);

        Map<String, Object> bodyObj = new HashMap<>();
        bodyObj.put("body", textBody);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("messaging_product", "whatsapp");
        requestBody.put("to", toPhone);
        requestBody.put("type", "text");
        requestBody.put("text", bodyObj);

        try {
            ResponseEntity<JsonNode> response = restTemplate.postForEntity(url, new HttpEntity<>(requestBody, headers), JsonNode.class);
            return response.getBody().path("messages").get(0).path("id").asText();
        } catch (Exception e) {
            System.err.println("❌ Failed to send reply: " + e.getMessage());
            return "gocrm_manual_" + UUID.randomUUID().toString();
        }
    }
}