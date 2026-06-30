package com.gocrm.core.controller;

import com.gocrm.core.entity.SupportTicket;
import com.gocrm.core.entity.TicketResolution;
import com.gocrm.core.entity.User;
import com.gocrm.core.repository.LeadRepository; 
import com.gocrm.core.repository.SupportTicketRepository;
import com.gocrm.core.repository.TicketResolutionRepository;
import com.gocrm.core.repository.UserRepository;
import com.gocrm.core.service.ChatSummarizationService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/v1/tickets")
@CrossOrigin(origins = "*") 
public class TicketController {

    private final SupportTicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final ChatSummarizationService chatSummarizationService;
    private final LeadRepository leadRepository;
    private final TicketResolutionRepository ticketResolutionRepository;

    public TicketController(SupportTicketRepository ticketRepository, 
                            UserRepository userRepository, 
                            ChatSummarizationService chatSummarizationService,
                            LeadRepository leadRepository,
                            TicketResolutionRepository ticketResolutionRepository) { 
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.chatSummarizationService = chatSummarizationService;
        this.leadRepository = leadRepository;
        this.ticketResolutionRepository = ticketResolutionRepository;
    }

    @GetMapping("/active")
    public ResponseEntity<List<SupportTicket>> getActiveTickets(Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        User currentUser = userRepository.findByEmail(principal.getName()).orElseThrow();
        if (currentUser.getCompany() == null) return ResponseEntity.ok(Collections.emptyList());

        return ResponseEntity.ok(ticketRepository.findByCompanyIdAndTicketStatusOrderByCreatedAtDesc(currentUser.getCompany().getId(), "OPEN"));
    }

    @PutMapping("/{ticketId}/close")
    public ResponseEntity<SupportTicket> closeTicket(@PathVariable Long ticketId, Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        SupportTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        ticket.setTicketStatus("CLOSED");
        ticketRepository.save(ticket);
        
        // 🚀 THE FIX: Log a permanent history record for the dashboard analytics
        TicketResolution resolution = new TicketResolution(
            ticket.getId(),
            ticket.getCompanyId(),
            ticket.getAssignedUserId(), // The Sales Rep who closed it
            ticket.getIssueDescription()
        );
        ticketResolutionRepository.save(resolution);
        
        leadRepository.findById(ticket.getLeadId()).ifPresent(lead -> {
            lead.setBotMode(true);
            leadRepository.save(lead);
        });
        
        chatSummarizationService.generateAndSaveSummary(ticket.getLeadId());

        return ResponseEntity.ok(ticket);
    }

    @GetMapping
    public ResponseEntity<List<SupportTicket>> getAllTickets(@RequestParam(required = false) Long companyId,Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        User currentUser = userRepository.findByEmail(principal.getName()).orElseThrow();
        if (currentUser.getCompany() == null) return ResponseEntity.ok(Collections.emptyList());

        Long targetCompanyId = companyId != null ? companyId : currentUser.getCompany().getId();
        return ResponseEntity.ok(ticketRepository.findByCompanyIdOrderByCreatedAtDesc(targetCompanyId));
    }
}