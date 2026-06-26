package com.gocrm.core.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gocrm.core.entity.*;
import com.gocrm.core.repository.*;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class WhatsAppService {

    private final ChatModel chatModel;
    private final CompanyBotValueRepository botValueRepository;
    private final WhatsAppConfigRepository waConfigRepository;
    private final CompanyRepository companyRepository;
    private final LeadRepository leadRepository;
    private final ConversationLogRepository conversationLogRepository; 
    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepository userRepository;

    public WhatsAppService(ChatModel chatModel, 
                           CompanyBotValueRepository botValueRepository, 
                           WhatsAppConfigRepository waConfigRepository,
                           CompanyRepository companyRepository,
                           LeadRepository leadRepository,
                           ConversationLogRepository conversationLogRepository,
                           SimpMessagingTemplate messagingTemplate,
                           UserRepository userRepository) {
        this.chatModel = chatModel;
        this.botValueRepository = botValueRepository;
        this.waConfigRepository = waConfigRepository;
        this.companyRepository = companyRepository;
        this.leadRepository = leadRepository;
        this.conversationLogRepository = conversationLogRepository;
        this.messagingTemplate = messagingTemplate;
        this.userRepository = userRepository;
    }

    public void processIncomingMessage(String payload) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(payload);
            JsonNode value = root.path("entry").get(0).path("changes").get(0).path("value");

            if (value.has("messages")) {
                String receivingPhoneNumberId = value.path("metadata").path("phone_number_id").asText();
                
                WhatsAppConfig waConfig = waConfigRepository.findByPhoneNumberId(receivingPhoneNumberId)
                    .orElseThrow(() -> new RuntimeException("No company found for this number"));
                
                Long companyId = waConfig.getCompany().getId(); 
                String accessToken = waConfig.getAccessToken();
                
                Company company = companyRepository.findById(companyId).orElseThrow();
                String companyName = company.getCompanyName();

                JsonNode messageNode = value.path("messages").get(0);
                String senderPhone = messageNode.path("from").asText();
                String messageText = messageNode.path("text").path("body").asText();
                String wamid = messageNode.path("id").asText(); // Meta's unique message ID

                // 1. Fetch or Create Lead using whatsappId
                Optional<Lead> optionalLead = leadRepository.findByCompanyIdAndWhatsappId(companyId, senderPhone);
                Lead lead;

                if (optionalLead.isEmpty()) {
                    lead = new Lead();
                    lead.setCompanyId(companyId);
                    lead.setWhatsappId(senderPhone);
                    lead.setPipelineStatus("NEW");
                    lead.setBotMode(true); // AI takes the wheel initially
                    lead = leadRepository.save(lead);

                    // Log INBOUND customer message
                    ConversationLog savedLog = logConversation(lead.getId(), null, wamid, "INBOUND", messageText);
                    messagingTemplate.convertAndSend("/topic/chat/" + lead.getId(), savedLog);

                    String welcomeMsg = String.format("Hello, welcome to %s. We appreciate your interest in our company. I am an AI-powered assistant here to help you communicate with us.\n\nCould you please provide your full name?", companyName);
                    sendReplyAndLog(senderPhone, welcomeMsg, receivingPhoneNumberId, accessToken, lead.getId());
                    return; 
                }

                lead = optionalLead.get();
                
                // Prevent duplicate processing if Meta resends the webhook payload
                if (conversationLogRepository.existsByWamid(wamid)) return;
                

                ConversationLog savedLog = logConversation(lead.getId(), null, wamid, "INBOUND", messageText);
                messagingTemplate.convertAndSend("/topic/chat/" + lead.getId(), savedLog);
                
                // 2. Capture Missing Name
                if (lead.getCustomerName() == null || lead.getCustomerName().trim().isEmpty()) {
                    lead.setCustomerName(messageText.trim());
                    leadRepository.save(lead);

                    String thanksMsg = String.format("Welcome back, %s! How can I help you today?", lead.getCustomerName());
                    sendReplyAndLog(senderPhone, thanksMsg, receivingPhoneNumberId, accessToken, lead.getId());
                    return;
                }

                // 3. Check for Human Handover
                if (messageText.toLowerCase().contains("@sales_representative")) {
                    lead.setBotMode(false); // Disengage AI
                    
                    // 🚀 NEW LOGIC: Assign to a human representative automatically
                    Optional<User> availableRep = userRepository.findFirstByCompanyId(companyId);
                    if (availableRep.isPresent()) {
                        lead.setAssignedUserId(availableRep.get().getId());
                    } else {
                        System.err.println("No human representatives found for company " + companyId);
                    }

                    leadRepository.save(lead);

                    String transferMsg = "I am transferring you to a human representative. They will review our chat and be with you shortly.";
                    sendReplyAndLog(senderPhone, transferMsg, receivingPhoneNumberId, accessToken, lead.getId());
                    return;
                }

                // 4. Stop if Human is handling it
                if (!lead.isBotMode()) {
                    System.out.println("🔇 Message ignored by AI (Handled by HUMAN): " + messageText);
                    return;
                }

                // 5. AI Generation
                List<CompanyBotValue> botValues = botValueRepository.findByCompanyId(companyId);
                String companyKnowledge = "";
                String companyGuardrails = "";

                for (CompanyBotValue botVal : botValues) {
                    if ("knowledge_base".equals(botVal.getTemplate().getFieldKey())) companyKnowledge = botVal.getFieldValue();
                    else if ("guardrails".equals(botVal.getTemplate().getFieldKey())) companyGuardrails = botVal.getFieldValue();
                }

                String systemText = String.format(
                    "You are a strict AI assistant for %s. You are speaking with %s.\nGuardrails:\n%s\nKnowledge Base:\n%s", 
                    companyName, lead.getCustomerName(), companyGuardrails, companyKnowledge
                );
                
                SystemMessage systemMessage = new SystemMessage(systemText);
                UserMessage userMessage = new UserMessage(messageText);
                Prompt prompt = new Prompt(List.of(systemMessage, userMessage));
                
                String aiResponse = chatModel.call(prompt).getResult().getOutput().getText();

                sendReplyAndLog(senderPhone, aiResponse, receivingPhoneNumberId, accessToken, lead.getId());
            }
        } catch (Exception e) {
            System.err.println("Error processing message: " + e.getMessage());
        }
    }

    private void sendReplyAndLog(String toPhone, String textBody, String phoneNumberId, String accessToken, Long leadId) {
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
            
            String outboundWamid = response.getBody().path("messages").get(0).path("id").asText();
            logConversation(leadId, null, outboundWamid, "OUTBOUND", textBody);
            
        } catch (Exception e) {
            System.err.println("❌ Failed to send reply: " + e.getMessage());
        }
    }

    private ConversationLog logConversation(Long leadId, Long senderUserId, String wamid, String direction, String messageBody) {
        if (wamid == null || wamid.isEmpty()) wamid = "gocrm_" + UUID.randomUUID().toString();
        ConversationLog log = new ConversationLog(leadId, senderUserId, wamid, direction, messageBody);
        return conversationLogRepository.save(log);
    }
}