package com.gocrm.core.controller;

import com.gocrm.core.entity.Lead;
import com.gocrm.core.entity.User;
import com.gocrm.core.repository.LeadRepository;
import com.gocrm.core.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/v1/leads")
@CrossOrigin(origins = "*") 
public class LeadController {

    private final LeadRepository leadRepository;
    private final UserRepository userRepository;

    public LeadController(LeadRepository leadRepository, UserRepository userRepository) {
        this.leadRepository = leadRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<Lead>> getActiveLeads(Principal principal) {
        // 1. Ensure the request is authenticated via JWT
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // 2. Fetch the live user from the database
        User currentUser = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (currentUser.getCompany() == null) {
            return ResponseEntity.ok(Collections.emptyList()); 
        }

        // 3. Extract the dynamic company ID and fetch the leads!
        Long dynamicCompanyId = currentUser.getCompany().getId();
        List<Lead> leads = leadRepository.findByCompanyIdOrderByCreatedAtDesc(dynamicCompanyId);
        
        return ResponseEntity.ok(leads);
    }
}