package com.gocrm.core.controller;

import com.gocrm.core.entity.LeadTransaction;
import com.gocrm.core.entity.User;
import com.gocrm.core.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/user-dashboard")
@CrossOrigin(origins = "*")
public class UserDashboardController {

    private final LeadRepository leadRepository;
    private final LeadTransactionRepository transactionRepository;
    private final SupportTicketRepository ticketRepository;
    private final UserRepository userRepository;

    public UserDashboardController(LeadRepository leadRepository, 
                               LeadTransactionRepository transactionRepository,
                               SupportTicketRepository ticketRepository,
                               UserRepository userRepository) {
        this.leadRepository = leadRepository;
        this.transactionRepository = transactionRepository;
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/rep")
    public ResponseEntity<?> getRepDashboard(@RequestParam(required = false) Integer month, 
                                             @RequestParam(required = false) Integer year,
                                             Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        User user = userRepository.findByEmail(principal.getName()).orElseThrow();
        Long userId = user.getId();
        Long companyId = user.getCompany().getId();

        ZonedDateTime now = ZonedDateTime.now();
        int targetMonth = (month != null) ? month : now.getMonthValue();
        int targetYear = (year != null) ? year : now.getYear();

        Double totalRevenue = transactionRepository.findByCompanyId(companyId).stream()
                .filter(t -> t.getAssignedUserId() != null && t.getAssignedUserId().equals(userId))
                .mapToDouble(LeadTransaction::getAmount).sum();

        ZonedDateTime start = ZonedDateTime.of(targetYear, targetMonth, 1, 0, 0, 0, 0, now.getZone());
        ZonedDateTime end = start.plusMonths(1);
        
        List<LeadTransaction> monthlyTransactions = transactionRepository.findByCompanyIdAndClosedAtBetween(companyId, start, end)
                .stream()
                .filter(t -> t.getAssignedUserId() != null && t.getAssignedUserId().equals(userId))
                .collect(Collectors.toList());

        Double monthlyRevenue = monthlyTransactions.stream().mapToDouble(LeadTransaction::getAmount).sum();

        long activeLeads = leadRepository.findByCompanyIdOrderByCreatedAtDesc(companyId).stream()
                .filter(l -> l.getAssignedUserId() != null && l.getAssignedUserId().equals(userId))
                .filter(l -> List.of("NEW", "DISCOVERY", "PROPOSAL_SENT", "NEGOTIATION").contains(l.getPipelineStatus()))
                .count();

        long newLeadsThisMonth = leadRepository.findByCompanyIdOrderByCreatedAtDesc(companyId).stream()
                .filter(l -> l.getAssignedUserId() != null && l.getAssignedUserId().equals(userId))
                .filter(l -> l.getPipelineStatus().equals("NEW"))
                .filter(l -> l.getCreatedAt().isAfter(start) && l.getCreatedAt().isBefore(end))
                .count();

        long totalWon = leadRepository.findByCompanyIdOrderByCreatedAtDesc(companyId).stream()
                .filter(l -> l.getAssignedUserId() != null && l.getAssignedUserId().equals(userId))
                .filter(l -> l.getPipelineStatus().equals("WON"))
                .count();

        long totalResolved = ticketRepository.findByCompanyIdAndTicketStatusOrderByCreatedAtDesc(companyId, "CLOSED").stream()
                .filter(t -> t.getAssignedUserId() != null && t.getAssignedUserId().equals(userId))
                .count();

        Map<Integer, Double> dailyRevenueMap = monthlyTransactions.stream()
                .collect(Collectors.groupingBy(
                        t -> t.getClosedAt().getDayOfMonth(),
                        Collectors.summingDouble(LeadTransaction::getAmount)
                ));

        int daysInMonth = start.toLocalDate().lengthOfMonth();
        List<Map<String, Object>> chartData = new ArrayList<>();
        
        double cumulativeRevenue = 0.0;
        double monthlySalesGoal = 10000.0; 
        double dailyGoalStep = monthlySalesGoal / daysInMonth;

        for (int i = 1; i <= daysInMonth; i++) {
            double dailyRev = dailyRevenueMap.getOrDefault(i, 0.0);
            cumulativeRevenue += dailyRev;
            
            chartData.add(Map.of(
                    "day", String.format("%02d", i),
                    "revenue", dailyRev,
                    "cumulativeRevenue", cumulativeRevenue,
                    "goalTrack", dailyGoalStep * i 
            ));
        }

        return ResponseEntity.ok(Map.of(
                "totalRevenue", totalRevenue,
                "monthlyRevenue", monthlyRevenue,
                "activeLeads", activeLeads,
                "newLeadsThisMonth", newLeadsThisMonth,
                "totalWon", totalWon,
                "totalResolved", totalResolved,
                "chartData", chartData
        ));
    }
}