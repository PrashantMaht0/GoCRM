package com.gocrm.core.controller;

import com.gocrm.core.entity.LeadTransaction;
import com.gocrm.core.entity.User;
import com.gocrm.core.repository.*;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;

import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.security.Principal;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/ai-reports")
@CrossOrigin(origins = "*")
public class AIReportController {

    private final ChatModel chatModel;
    private final LeadTransactionRepository transactionRepository;
    private final SupportTicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final Bucket bucket;

    public AIReportController(ChatModel chatModel,
                              LeadTransactionRepository transactionRepository,
                              SupportTicketRepository ticketRepository,
                              UserRepository userRepository) {
        this.chatModel = chatModel;
        this.transactionRepository = transactionRepository;
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;

        Bandwidth limit = Bandwidth.classic(3, Refill.greedy(3, java.time.Duration.ofMinutes(1)));
        this.bucket = Bucket.builder().addLimit(limit).build();
    }

    @GetMapping("/executive")
    public ResponseEntity<?> generateExecutiveReport(@RequestParam(required = false) Long companyId, Principal principal) {

        if (!bucket.tryConsume(1)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("error", "Rate limit exceeded. Please wait a minute before generating another report."));
        }

        if (principal == null) return ResponseEntity.status(401).build();
        User currentUser = userRepository.findByEmail(principal.getName()).orElseThrow();

        Long targetCompanyId = (currentUser.getRole().toString().equals("ADMIN") && companyId != null) 
            ? companyId 
            : currentUser.getCompany().getId();

        ZonedDateTime startOfMonth = ZonedDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0);
        List<LeadTransaction> monthlyTransactions = transactionRepository.findByCompanyIdAndClosedAtBetween(
                targetCompanyId, startOfMonth, ZonedDateTime.now());
        
        double monthlyRevenue = monthlyTransactions.stream().mapToDouble(LeadTransaction::getAmount).sum();

        long openTickets = ticketRepository.findByCompanyIdOrderByCreatedAtDesc(targetCompanyId).stream()
                .filter(t -> "OPEN".equals(t.getTicketStatus()))
                .count();

        String topRepName = "No deals closed yet";
        Map<Long, Double> repRevenue = monthlyTransactions.stream()
                .filter(t -> t.getAssignedUserId() != null)
                .collect(Collectors.groupingBy(LeadTransaction::getAssignedUserId, Collectors.summingDouble(LeadTransaction::getAmount)));

        if (!repRevenue.isEmpty()) {
            Long topRepId = repRevenue.entrySet().stream().max(Map.Entry.comparingByValue()).get().getKey();
            topRepName = userRepository.findById(topRepId).map(u -> u.getEmail().split("@")[0]).orElse("Unknown Rep");
        }

        String promptText = String.format(
            "You are an expert Sales Director and CRM analyst. Write a highly professional, 3-paragraph 'Executive Performance Review' for the admin of this workspace. " +
            "Here is the current month's data:\n" +
            "- Monthly Revenue: $%.2f\n" +
            "- Top Performing Representative: %s\n" +
            "- Unresolved Support Tickets: %d\n\n" +
            "Guidelines:\n" +
            "1. Paragraph 1: Acknowledge the revenue and overall momentum.\n" +
            "2. Paragraph 2: Highlight the top performer.\n" +
            "3. Paragraph 3: Address the support ticket backlog (praise if 0, warn if high) and provide a closing motivational thought. " +
            "Do not include greetings like 'Dear Admin', just output the report directly.",
            monthlyRevenue, topRepName, openTickets
        );

        String report = chatModel.call(new Prompt(promptText)).getResult().getOutput().getText();

        return ResponseEntity.ok(Map.of("report", report));
    }
}