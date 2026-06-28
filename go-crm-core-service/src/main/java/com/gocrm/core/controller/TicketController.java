package com.gocrm.core.controller;

import com.gocrm.core.entity.SupportTicket;
import com.gocrm.core.entity.User;
import com.gocrm.core.repository.LeadRepository; // 🚀 ADDED
import com.gocrm.core.repository.SupportTicketRepository;
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

    public TicketController(SupportTicketRepository ticketRepository, 
                            UserRepository userRepository, 
                            ChatSummarizationService chatSummarizationService,
                            LeadRepository leadRepository) { 
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.chatSummarizationService = chatSummarizationService;
        this.leadRepository = leadRepository;
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
        
        // 🚀 FIX: Turn the AI bot back on and clear the human rep!
        leadRepository.findById(ticket.getLeadId()).ifPresent(lead -> {
            lead.setBotMode(true);
            lead.setAssignedUserId(null);
            leadRepository.save(lead);
        });
        
        chatSummarizationService.generateAndSaveSummary(ticket.getLeadId());

        return ResponseEntity.ok(ticket);
    }

    @GetMapping
    public ResponseEntity<List<SupportTicket>> getAllTickets(Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        User currentUser = userRepository.findByEmail(principal.getName()).orElseThrow();
        if (currentUser.getCompany() == null) return ResponseEntity.ok(Collections.emptyList());

        return ResponseEntity.ok(ticketRepository.findByCompanyIdOrderByCreatedAtDesc(currentUser.getCompany().getId()));
    }
}