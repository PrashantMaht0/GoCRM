package com.gocrm.core.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gocrm.core.entity.CompanyBotValue;
import com.gocrm.core.entity.WhatsAppConfig;
import com.gocrm.core.repository.WhatsAppConfigRepository;
import com.gocrm.core.repository.CompanyBotValueRepository;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class WhatsAppService {

    private final ChatModel chatModel;
    private final CompanyBotValueRepository botValueRepository;
    private final WhatsAppConfigRepository waConfigRepository;

    @Autowired
    public WhatsAppService(ChatModel chatModel, CompanyBotValueRepository botValueRepository , WhatsAppConfigRepository waConfigRepository) {
        this.chatModel = chatModel;
        this.botValueRepository = botValueRepository;
        this.waConfigRepository = waConfigRepository;
    }

    public void processIncomingMessage(String payload) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(payload);

            JsonNode entry = root.path("entry").get(0);
            JsonNode changes = entry.path("changes").get(0);
            JsonNode value = changes.path("value");

            if (value.has("messages")) {
                // 1. Identify which company received the message
                String receivingPhoneNumberId = value.path("metadata").path("phone_number_id").asText();
                
                // 2. Fetch the Company ID and Meta Tokens using that Phone Number ID
                WhatsAppConfig waConfig = waConfigRepository.findByPhoneNumberId(receivingPhoneNumberId)
                    .orElseThrow(() -> new RuntimeException("No company found for this number"));
                Long companyId = waConfig.getCompany().getId();
                String accessToken = waConfig.getAccessToken();

                // 3. Extract the message details
                JsonNode messageNode = value.path("messages").get(0);
                String senderPhone = messageNode.path("from").asText();
                String messageText = messageNode.path("text").path("body").asText();

                System.out.println("📬 Incoming from (" + senderPhone + ") to Company ID " + companyId);

                // 4. Fetch the dynamic bot configuration from the database
                List<CompanyBotValue> botValues = botValueRepository.findByCompanyId(companyId);
                
                String companyKnowledge = "";
                String companyGuardrails = "";

                for (CompanyBotValue botVal : botValues) {
                    if ("knowledge_base".equals(botVal.getTemplate().getFieldKey())) {
                        companyKnowledge = botVal.getFieldValue();
                    } else if ("guardrails".equals(botVal.getTemplate().getFieldKey())) {
                        companyGuardrails = botVal.getFieldValue();
                    }
                }

                // If DB is empty, provide a fallback
                if (companyKnowledge.isEmpty()) companyKnowledge = "You are a helpful assistant.";

                // 5. Construct the Prompt dynamically
                String systemPrompt = String.format(
                    "You are a strict, professional AI assistant for this company. " +
                    "You must obey the following guardrails unconditionally:\n%s\n\n" +
                    "You may ONLY use the following knowledge base to answer questions. If the answer is not in this knowledge base, you must politely say 'I do not have that information' and offer to connect them to a human.\n" +
                    "Knowledge Base:\n%s", 
                    companyGuardrails, 
                    companyKnowledge
                );
                
                String userPrompt = systemPrompt + "\nCustomer says: " + messageText;
                
                // Call the local model
                String aiResponse = chatModel.call(userPrompt);
                System.out.println("🤖 Ollama Responded: " + aiResponse);

                // Send it back to WhatsApp
                sendReply(senderPhone, aiResponse, receivingPhoneNumberId, accessToken);
            }
        } catch (Exception e) {
            System.err.println("Error processing message: " + e.getMessage());
        }
    }

    private void sendReply(String toPhone, String textBody, String phoneNumberId, String accessToken) {
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

        System.out.println("🔑 Using Token: " + accessToken.substring(0, Math.min(accessToken.length(), 15)) + "...");
        
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            restTemplate.postForEntity(url, entity, String.class);
            System.out.println("🚀 AI Reply successfully sent to " + toPhone);
        } catch (Exception e) {
            System.err.println("❌ Failed to send reply: " + e.getMessage());
        }
    }
}