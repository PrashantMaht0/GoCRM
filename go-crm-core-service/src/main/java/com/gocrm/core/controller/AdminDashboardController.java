package com.gocrm.core.controller;

import com.gocrm.core.entity.LeadTransaction;
import com.gocrm.core.entity.User;
import com.gocrm.core.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/dashboard/admin")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    private final LeadRepository leadRepository;
    private final LeadTransactionRepository transactionRepository;
    private final SupportTicketRepository ticketRepository;
    private final UserRepository userRepository;

    public AdminDashboardController(LeadRepository leadRepository, 
                               LeadTransactionRepository transactionRepository,
                               SupportTicketRepository ticketRepository,
                               UserRepository userRepository) {
        this.leadRepository = leadRepository;
        this.transactionRepository = transactionRepository;
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<?> getAdminDashboard(@RequestParam(required = false) Long companyId,
                                             @RequestParam(required = false) Integer month, 
                                             @RequestParam(required = false) Integer year,
                                             Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        User currentUser = userRepository.findByEmail(principal.getName()).orElseThrow();
        
        Long targetCompanyId;
        if (currentUser.getRole().toString().equals("ADMIN") && companyId != null) {
            targetCompanyId = companyId;
        } else {
            if (currentUser.getCompany() == null) return ResponseEntity.status(404).body(Map.of("error", "No workspace found"));
            targetCompanyId = currentUser.getCompany().getId();
        }

        ZonedDateTime now = ZonedDateTime.now();
        int targetMonth = (month != null) ? month : now.getMonthValue();
        int targetYear = (year != null) ? year : now.getYear();

        Double totalRevenue = transactionRepository.findByCompanyId(targetCompanyId).stream()
                .mapToDouble(LeadTransaction::getAmount).sum();

        ZonedDateTime start = ZonedDateTime.of(targetYear, targetMonth, 1, 0, 0, 0, 0, now.getZone());
        ZonedDateTime end = start.plusMonths(1);
        
        List<LeadTransaction> monthlyTransactions = transactionRepository.findByCompanyIdAndClosedAtBetween(targetCompanyId, start, end);
        Double monthlyRevenue = monthlyTransactions.stream().mapToDouble(LeadTransaction::getAmount).sum();

        long activeLeads = leadRepository.findByCompanyIdOrderByCreatedAtDesc(targetCompanyId).stream()
                .filter(l -> List.of("NEW", "DISCOVERY", "PROPOSAL_SENT", "NEGOTIATION").contains(l.getPipelineStatus()))
                .count();

        long openTickets = ticketRepository.findByCompanyIdOrderByCreatedAtDesc(targetCompanyId).stream()
                .filter(t -> "OPEN".equals(t.getTicketStatus()))
                .count();

        long totalWon = leadRepository.findByCompanyIdOrderByCreatedAtDesc(targetCompanyId).stream()
                .filter(l -> "WON".equals(l.getPipelineStatus()))
                .count();

        Map<Long, Double> repRevenue = monthlyTransactions.stream()
                .filter(t -> t.getAssignedUserId() != null)
                .collect(Collectors.groupingBy(LeadTransaction::getAssignedUserId, Collectors.summingDouble(LeadTransaction::getAmount)));

        List<Map<String, Object>> leaderboard = new ArrayList<>();
        
        for (Map.Entry<Long, Double> entry : repRevenue.entrySet()) {
            String repName = userRepository.findById(entry.getKey())
                    .map(u -> u.getEmail().split("@")[0]) 
                    .orElse("Unknown Rep");
            
            leaderboard.add(Map.of(
                    "name", repName,
                    "revenue", entry.getValue()
            ));
        }
        
        leaderboard.sort((a, b) -> Double.compare((Double) b.get("revenue"), (Double) a.get("revenue")));

        return ResponseEntity.ok(Map.of(
                "totalRevenue", totalRevenue,
                "monthlyRevenue", monthlyRevenue,
                "activeLeads", activeLeads,
                "openTickets", openTickets,
                "totalWon", totalWon,
                "leaderboard", leaderboard
        ));
    }
}