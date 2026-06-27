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
    private final SimpMessagingTemplate messagingTemplate; 

    public ChatController(ConversationLogRepository conversationLogRepository, LeadRepository leadRepository, WhatsAppConfigRepository waConfigRepository, SimpMessagingTemplate messagingTemplate) {
        this.conversationLogRepository = conversationLogRepository;
        this.leadRepository = leadRepository;
        this.waConfigRepository = waConfigRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @GetMapping("/{leadId}")
    public ResponseEntity<List<ConversationLog>> getChatHistory(@PathVariable Long leadId) {
        return ResponseEntity.ok(conversationLogRepository.findByLeadIdOrderByCreatedAtAsc(leadId));
    }

    @PostMapping("/{leadId}/send")
    public ResponseEntity<?> sendManualMessage(@PathVariable Long leadId, @RequestBody Map<String, String> payload) {
        String messageBody = payload.get("message");
        Lead lead = leadRepository.findById(leadId).orElseThrow();
        String accessToken = waConfigRepository.findByCompanyId(lead.getCompanyId()).get().getAccessToken();
        String phoneNumberId = waConfigRepository.findByCompanyId(lead.getCompanyId()).get().getPhoneNumberId();

        String wamid = sendToMetaApi(lead.getWhatsappId(), messageBody, phoneNumberId, accessToken);

        ConversationLog savedLog = new ConversationLog(lead.getId(), lead.getAssignedUserId(), wamid, "OUTBOUND", messageBody);
        conversationLogRepository.save(savedLog);
        messagingTemplate.convertAndSend("/topic/chat/" + leadId, savedLog);

        return ResponseEntity.ok(savedLog);
    }

    private String sendToMetaApi(String toPhone, String textBody, String phoneNumberId, String accessToken) {
        RestTemplate restTemplate = new RestTemplate();
        String url = "https://graph.facebook.com/v20.0/" + phoneNumberId + "/messages";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(accessToken);

        Map<String, Object> bodyObj = new HashMap<>(); bodyObj.put("body", textBody);
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("messaging_product", "whatsapp");
        requestBody.put("to", toPhone);
        requestBody.put("type", "text");
        requestBody.put("text", bodyObj);

        try {
            ResponseEntity<JsonNode> response = restTemplate.postForEntity(url, new HttpEntity<>(requestBody, headers), JsonNode.class);
            return response.getBody().path("messages").get(0).path("id").asText();
        } catch (Exception e) {
            return "gocrm_manual_" + UUID.randomUUID().toString();
        }
    }
}