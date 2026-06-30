package com.gocrm.core.controller;

import com.gocrm.core.entity.ChatSummary;
import com.gocrm.core.entity.Lead;
import com.gocrm.core.entity.LeadRequirement;
import com.gocrm.core.entity.LeadTransaction;
import com.gocrm.core.entity.User;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gocrm.core.dto.LeadCreateRequest;
import com.gocrm.core.dto.LeadDTO;
import com.gocrm.core.dto.LeadUpdateRequest;
import com.gocrm.core.repository.ChatSummaryRepository;
import com.gocrm.core.repository.LeadRepository;
import com.gocrm.core.repository.UserRepository;
import com.gocrm.core.repository.LeadRequirementRepository;
import com.gocrm.core.repository.LeadTransactionRepository;
import com.gocrm.core.service.ChatSummarizationService;

import jakarta.validation.Valid;

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
    private final LeadTransactionRepository transactionRepository;  

    public LeadController(LeadRepository leadRepository, UserRepository userRepository, ChatSummarizationService chatSummarizationService, ChatSummaryRepository chatSummaryRepository, LeadRequirementRepository leadRequirementRepository, LeadTransactionRepository transactionRepository) {
        this.leadRepository = leadRepository;
        this.userRepository = userRepository;
        this.chatSummarizationService = chatSummarizationService;
        this.chatSummaryRepository = chatSummaryRepository;
        this.leadRequirementRepository = leadRequirementRepository;
        this.transactionRepository = transactionRepository;
    }

    @GetMapping
    public ResponseEntity<List<LeadDTO>> getActiveLeads(@RequestParam(required = false)  Long companyId, Principal principal) {
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
        
        String status = (String) payload.get("status");
        lead.setPipelineStatus(status);
        
        if (payload.containsKey("contractValue") && payload.get("contractValue") != null) {
            lead.setContractValue(Double.valueOf(payload.get("contractValue").toString()));
        }

        if ("WON".equals(status) && lead.getContractValue() != null && lead.getContractValue() > 0) {
            LeadTransaction transaction = new LeadTransaction();
            transaction.setLeadId(lead.getId());
            transaction.setCompanyId(lead.getCompanyId());
            transaction.setAssignedUserId(lead.getAssignedUserId());
            transaction.setAmount(lead.getContractValue());
            transactionRepository.save(transaction);
            
            Double currentLTV = lead.getLifetimeValue() == null ? 0.0 : lead.getLifetimeValue();
            lead.setLifetimeValue(currentLTV + lead.getContractValue());
            lead.setContractValue(0.0);
        }
        
        lead.setBotMode(true); 
        leadRepository.save(lead);
        chatSummarizationService.generateAndSaveSummary(leadId);

        return ResponseEntity.ok(lead);
    }

    @PostMapping
    public ResponseEntity<LeadDTO> createManualLead(@Valid @RequestBody LeadCreateRequest payload, Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        User currentUser = userRepository.findByEmail(principal.getName()).orElseThrow();

        Lead lead = new Lead();
        lead.setCompanyId(currentUser.getCompany().getId());
        
        lead.setCustomerName(payload.customerName());
        lead.setWhatsappId(payload.whatsappId()); 
        
        lead.setPipelineStatus("NEW"); 
        lead.setBotMode(false); 
        lead.setAssignedUserId(currentUser.getId()); 
        
        lead = leadRepository.save(lead);
        return ResponseEntity.ok(new LeadDTO(lead, null));
    }

    @PutMapping("/{leadId}")
    public ResponseEntity<LeadDTO> updateLeadDetails(@PathVariable Long leadId, @Valid @RequestBody LeadUpdateRequest payload, Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Lead lead = leadRepository.findById(leadId).orElseThrow();
        
        if (payload.contractValue() != null) {
            lead.setContractValue(payload.contractValue());
        }
        if (payload.pipelineStatus() != null) {
            String newStatus = payload.pipelineStatus();
            lead.setPipelineStatus(newStatus);

            if ("WON".equals(newStatus) && lead.getContractValue() != null && lead.getContractValue() > 0) {
                LeadTransaction transaction = new LeadTransaction();
                transaction.setLeadId(lead.getId());
                transaction.setCompanyId(lead.getCompanyId());
                transaction.setAssignedUserId(lead.getAssignedUserId());
                transaction.setAmount(lead.getContractValue());
                transactionRepository.save(transaction);
                
                Double currentLTV = lead.getLifetimeValue() == null ? 0.0 : lead.getLifetimeValue();
                lead.setLifetimeValue(currentLTV + lead.getContractValue());
                lead.setContractValue(0.0);
            }
            
            if ("WON".equals(newStatus) || "LOST".equals(newStatus)) {
                lead.setBotMode(true);
            }
        }        
        lead = leadRepository.save(lead);

        if (payload.requirements() != null) {
            LeadRequirement req = leadRequirementRepository.findByLeadId(leadId)
                    .orElse(new LeadRequirement(leadId, "{}"));
            try {
                ObjectMapper mapper = new ObjectMapper();
                String safeJson = mapper.writeValueAsString(Map.of("manual_notes", payload.requirements()));
                req.setExtractedData(safeJson);
            } catch (Exception e) {
                req.setExtractedData("{}");
            }
            leadRequirementRepository.save(req);
        }

        return ResponseEntity.ok(new LeadDTO(lead, null)); 
    }
}