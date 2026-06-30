package com.gocrm.core.service;

import com.gocrm.core.entity.ChatSummary;
import com.gocrm.core.entity.ConversationLog;
import com.gocrm.core.entity.LeadRequirement;
import com.gocrm.core.repository.ChatSummaryRepository;
import com.gocrm.core.repository.ConversationLogRepository;
import com.gocrm.core.repository.LeadRequirementRepository;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ChatSummarizationService {

    private final ChatModel chatModel;
    private final ConversationLogRepository conversationLogRepository;
    private final ChatSummaryRepository chatSummaryRepository;
    private final LeadRequirementRepository leadRequirementRepository; 

    public ChatSummarizationService(ChatModel chatModel, 
                                    ConversationLogRepository conversationLogRepository, 
                                    ChatSummaryRepository chatSummaryRepository,
                                    LeadRequirementRepository leadRequirementRepository) {
        this.chatModel = chatModel;
        this.conversationLogRepository = conversationLogRepository;
        this.chatSummaryRepository = chatSummaryRepository;
        this.leadRequirementRepository = leadRequirementRepository;
    }

    @Async("aiTaskExecutor")
    public void generateAndSaveSummary(Long leadId) {
        try {
            List<ConversationLog> logs = conversationLogRepository.findByLeadIdOrderByCreatedAtAsc(leadId);
            if (logs.isEmpty()) return;

            String formattedChat = logs.stream()
                    .map(log -> log.getDirection() + ": " + log.getMessageBody())
                    .collect(Collectors.joining("\n"));

            String summarySystemPrompt = "You are a CRM assistant. Read the following conversation between an AI bot and a customer. " +
                                  "Summarize the customer's core needs and context in exactly 2 short bullet points. " +
                                  "Do not include greetings or fluff.\n\nConversation:\n" + formattedChat;

            String summaryText = chatModel.call(new Prompt(summarySystemPrompt)).getResult().getOutput().getText();

            ChatSummary summary = chatSummaryRepository.findByLeadId(leadId).orElse(new ChatSummary(leadId, ""));
            summary.setSummaryText(summaryText);
            chatSummaryRepository.save(summary);
            

            
            Optional<LeadRequirement> existingReq = leadRequirementRepository.findByLeadId(leadId);
            String currentJson = existingReq.map(LeadRequirement::getExtractedData).orElse("{}");

            String jsonSystemPrompt = String.format(
                "You are a strict data extraction API. Your job is to extract business requirements from the conversation.\n" +
                "CURRENT JSON DATA:\n%s\n\n" +
                "CONVERSATION:\n%s\n\n" +
                "INSTRUCTIONS:\n" +
                "1. Update the CURRENT JSON DATA with any new insights (e.g., budget, timeline, desired product, pain points).\n" +
                "2. Output strictly valid JSON only. Do not wrap it in markdown blockquotes like ```json. Do not include any conversational text.", 
                currentJson, formattedChat
            );

            String rawJsonOutput = chatModel.call(new Prompt(jsonSystemPrompt)).getResult().getOutput().getText();
            
            String cleanJson = rawJsonOutput.replace("```json", "").replace("```", "").trim();

            LeadRequirement requirement = existingReq.orElse(new LeadRequirement(leadId, "{}"));
            requirement.setExtractedData(cleanJson);
            leadRequirementRepository.save(requirement);

            System.out.println("Background AI Summary & JSON Extraction completed for Lead ID: " + leadId);

        } catch (Exception e) {
            System.err.println("Failed to generate AI summary or extract JSON: " + e.getMessage());
        }
    }
}