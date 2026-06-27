package com.gocrm.core.controller;

import com.gocrm.core.entity.SupportTicket;
import com.gocrm.core.entity.User;
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

    public TicketController(SupportTicketRepository ticketRepository, UserRepository userRepository, ChatSummarizationService chatSummarizationService) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.chatSummarizationService = chatSummarizationService;
    }

    // 1. Fetch all OPEN tickets for the company's "Needs Attention" sidebar
    @GetMapping("/active")
    public ResponseEntity<List<SupportTicket>> getActiveTickets(Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        User currentUser = userRepository.findByEmail(principal.getName()).orElseThrow();
        if (currentUser.getCompany() == null) return ResponseEntity.ok(Collections.emptyList());

        List<SupportTicket> activeTickets = ticketRepository
                .findByCompanyIdAndTicketStatusOrderByCreatedAtDesc(currentUser.getCompany().getId(), "OPEN");
        
        return ResponseEntity.ok(activeTickets);
    }

    // 2. Close the ticket from the React UI
    @PutMapping("/{ticketId}/close")
    public ResponseEntity<SupportTicket> closeTicket(@PathVariable Long ticketId, Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        SupportTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        ticket.setTicketStatus("CLOSED");
        ticketRepository.save(ticket);
        
        
        chatSummarizationService.generateAndSaveSummary(ticket.getLeadId());

        return ResponseEntity.ok(ticket);
    }
}