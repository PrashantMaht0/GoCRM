package com.gocrm.core.controller;

import com.gocrm.core.entity.ChatSummary;
import com.gocrm.core.entity.Lead;
import com.gocrm.core.entity.LeadRequirement;
import com.gocrm.core.entity.User;
import com.gocrm.core.dto.LeadDTO;
import com.gocrm.core.repository.ChatSummaryRepository;
import com.gocrm.core.repository.LeadRepository;
import com.gocrm.core.repository.UserRepository;
import com.gocrm.core.repository.LeadRequirementRepository;
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
    private final LeadRequirementRepository leadRequirementRepository;

    public LeadController(LeadRepository leadRepository, UserRepository userRepository, ChatSummarizationService chatSummarizationService, ChatSummaryRepository chatSummaryRepository, LeadRequirementRepository leadRequirementRepository) {
        this.leadRepository = leadRepository;
        this.userRepository = userRepository;
        this.chatSummarizationService = chatSummarizationService;
        this.chatSummaryRepository = chatSummaryRepository;
        this.leadRequirementRepository = leadRequirementRepository; 
    }

    @GetMapping
    public ResponseEntity<List<LeadDTO>> getActiveLeads(@RequestParam(required = false) Long companyId, Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        User currentUser = userRepository.findByEmail(principal.getName()).orElseThrow();
        
        Long targetCompanyId;
        if (currentUser.getRole().toString().equals("ADMIN") && companyId != null) {
            targetCompanyId = companyId;
        } else {
            if (currentUser.getCompany() == null) return ResponseEntity.ok(Collections.emptyList());
            targetCompanyId = currentUser.getCompany().getId();
        }

        List<Lead> leads = leadRepository.findByCompanyIdOrderByCreatedAtDesc(targetCompanyId);

        List<LeadDTO> leadDTOs = leads.stream().map(lead -> {
            String summary = chatSummaryRepository.findByLeadId(lead.getId())
                    .map(ChatSummary::getSummaryText)
                    .orElse(null);
            return new LeadDTO(lead, summary);
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(leadDTOs);
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
        leadRepository.save(lead);
        chatSummarizationService.generateAndSaveSummary(leadId);

        return ResponseEntity.ok(lead);
    }

    @PostMapping
    public ResponseEntity<LeadDTO> createManualLead(@RequestBody Map<String, String> payload, Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        User currentUser = userRepository.findByEmail(principal.getName()).orElseThrow();

        Lead lead = new Lead();
        lead.setCompanyId(currentUser.getCompany().getId());
        lead.setCustomerName(payload.get("customerName"));
        lead.setWhatsappId(payload.get("whatsappId")); // e.g., +1234567890
        lead.setPipelineStatus("DISCOVERY"); // Start in the first Kanban stage
        lead.setBotMode(false); // Human is managing this
        lead.setAssignedUserId(currentUser.getId()); // Assign to the rep who created it
        
        lead = leadRepository.save(lead);
        return ResponseEntity.ok(new LeadDTO(lead, null));
    }

    @PutMapping("/{leadId}")
    public ResponseEntity<LeadDTO> updateLeadDetails(@PathVariable Long leadId, @RequestBody Map<String, Object> payload, Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Lead lead = leadRepository.findById(leadId).orElseThrow();
        
        if (payload.containsKey("pipelineStatus")) {
            String newStatus = (String) payload.get("pipelineStatus");
            lead.setPipelineStatus(newStatus);
            
            if ("WON".equals(newStatus) || "LOST".equals(newStatus)) {
                lead.setBotMode(true);
            }
        }
        
        if (payload.containsKey("contractValue")) {
            lead.setContractValue(Double.valueOf(payload.get("contractValue").toString()));
        }
        
        lead = leadRepository.save(lead);

        if (payload.containsKey("requirements")) {
            String notes = (String) payload.get("requirements");
            LeadRequirement req = leadRequirementRepository.findByLeadId(leadId)
                    .orElse(new LeadRequirement(leadId, "{}"));
            req.setExtractedData("{\"manual_notes\": \"" + notes.replace("\"", "\\\"") + "\"}");
            leadRequirementRepository.save(req);
        }

        return ResponseEntity.ok(new LeadDTO(lead, null)); 
    }

}