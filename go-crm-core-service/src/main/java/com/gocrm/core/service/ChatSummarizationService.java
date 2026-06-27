package com.gocrm.core.service;

import com.gocrm.core.entity.ChatSummary;
import com.gocrm.core.entity.ConversationLog;
import com.gocrm.core.repository.ChatSummaryRepository;
import com.gocrm.core.repository.ConversationLogRepository;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatSummarizationService {

    private final ChatModel chatModel;
    private final ConversationLogRepository conversationLogRepository;
    private final ChatSummaryRepository chatSummaryRepository;

    public ChatSummarizationService(ChatModel chatModel, 
                                    ConversationLogRepository conversationLogRepository, 
                                    ChatSummaryRepository chatSummaryRepository) {
        this.chatModel = chatModel;
        this.conversationLogRepository = conversationLogRepository;
        this.chatSummaryRepository = chatSummaryRepository;
    }

    @Async("aiTaskExecutor")
    public void generateAndSaveSummary(Long leadId) {
        try {
            // 1. Fetch all conversation logs for this lead
            List<ConversationLog> logs = conversationLogRepository.findByLeadIdOrderByCreatedAtAsc(leadId);
            
            if (logs.isEmpty()) return;

            // 2. Format the logs into a single readable string for the AI
            String formattedChat = logs.stream()
                    .map(log -> log.getDirection() + ": " + log.getMessageBody())
                    .collect(Collectors.joining("\n"));

            // 3. Prompt the AI for a concise summary
            String systemPrompt = "You are a CRM assistant. Read the following conversation between an AI bot and a customer. " +
                                  "Summarize the customer's core needs and context in exactly 2 short bullet points. " +
                                  "Do not include greetings or fluff.\n\nConversation:\n" + formattedChat;

            String summaryText = chatModel.call(new Prompt(systemPrompt)).getResult().getOutput().getText();

            // 4. Save to database (Update if exists, create if new)
            ChatSummary summary = chatSummaryRepository.findByLeadId(leadId)
                    .orElse(new ChatSummary(leadId, ""));
                    
            summary.setSummaryText(summaryText);
            chatSummaryRepository.save(summary);
            
            System.out.println("✅ Background AI Summary completed for Lead ID: " + leadId);

        } catch (Exception e) {
            System.err.println("❌ Failed to generate AI summary: " + e.getMessage());
        }
    }
}