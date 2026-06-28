package com.gocrm.core.controller;

import com.gocrm.core.entity.ChatSummary;
import com.gocrm.core.entity.Lead;
import com.gocrm.core.entity.User;
import com.gocrm.core.dto.LeadDTO;
import com.gocrm.core.repository.ChatSummaryRepository;
import com.gocrm.core.repository.LeadRepository;
import com.gocrm.core.repository.UserRepository;
import com.gocrm.core.service.ChatSummarizationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/leads")
@CrossOrigin(origins = "*") 
public class LeadController {

    private final LeadRepository leadRepository;
    private final UserRepository userRepository;
    private final ChatSummarizationService chatSummarizationService;
    private final ChatSummaryRepository chatSummaryRepository;

    public LeadController(LeadRepository leadRepository, UserRepository userRepository, ChatSummarizationService chatSummarizationService, ChatSummaryRepository chatSummaryRepository) {
        this.leadRepository = leadRepository;
        this.userRepository = userRepository;
        this.chatSummarizationService = chatSummarizationService;
        this.chatSummaryRepository = chatSummaryRepository; 
    }

    @GetMapping
    public ResponseEntity<List<LeadDTO>> getActiveLeads(Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        User currentUser = userRepository.findByEmail(principal.getName()).orElseThrow();
        if (currentUser.getCompany() == null) return ResponseEntity.ok(Collections.emptyList()); 

        List<Lead> leads = leadRepository.findByCompanyIdOrderByCreatedAtDesc(currentUser.getCompany().getId());

        List<LeadDTO> leadDTOs = leads.stream().map(lead -> {
            String summary = chatSummaryRepository.findByLeadId(lead.getId())
                    .map(ChatSummary::getSummaryText)
                    .orElse(null);
            return new LeadDTO(lead, summary);
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(leadDTOs);
    }

    @PutMapping("/{leadId}/leave")
    public ResponseEntity<Lead> leaveChat(@PathVariable Long leadId, Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Lead lead = leadRepository.findById(leadId).orElseThrow();
        lead.setAssignedUserId(null);
        lead.setBotMode(true); // Return to bot mode
        leadRepository.save(lead);

        // TRIGGER 2: Rep left, update the summary with their messages
        chatSummarizationService.generateAndSaveSummary(leadId);
        
        return ResponseEntity.ok(lead);
    }

    @PutMapping("/{leadId}/close")
    public ResponseEntity<Lead> closeLead(@PathVariable Long leadId, @RequestBody Map<String, Object> payload, Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Lead lead = leadRepository.findById(leadId).orElseThrow();
        
        lead.setPipelineStatus((String) payload.get("status"));
        if (payload.containsKey("contractValue") && payload.get("contractValue") != null) {
            lead.setContractValue(Double.valueOf(payload.get("contractValue").toString()));
        }
        
        lead.setBotMode(true); 
        lead.setAssignedUserId(null); 
        leadRepository.save(lead);

        // TRIGGER 3: Deal closed, generate final summary
        chatSummarizationService.generateAndSaveSummary(leadId);

        return ResponseEntity.ok(lead);
    }

}