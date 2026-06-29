package com.gocrm.core.controller;

import com.gocrm.core.entity.CompanyBotSettings;
import com.gocrm.core.entity.User;
import com.gocrm.core.repository.CompanyBotSettingsRepository;
import com.gocrm.core.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/v1/bot-settings")
@CrossOrigin(origins = "*")
public class CompanyBotSettingsController {

    private final CompanyBotSettingsRepository settingsRepository;
    private final UserRepository userRepository;

    public CompanyBotSettingsController(CompanyBotSettingsRepository settingsRepository, UserRepository userRepository) {
        this.settingsRepository = settingsRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<CompanyBotSettings> getSettings(Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        User currentUser = userRepository.findByEmail(principal.getName()).orElseThrow();
        if (currentUser.getCompany() == null) return ResponseEntity.badRequest().build();

        CompanyBotSettings settings = settingsRepository.findById(currentUser.getCompany().getId())
                .orElse(new CompanyBotSettings(currentUser.getCompany().getId(), "", ""));
        
        return ResponseEntity.ok(settings);
    }

    @PutMapping
    public ResponseEntity<CompanyBotSettings> updateSettings(@RequestBody CompanyBotSettings payload, Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        User currentUser = userRepository.findByEmail(principal.getName()).orElseThrow();
        if (currentUser.getCompany() == null) return ResponseEntity.badRequest().build();

        Long companyId = currentUser.getCompany().getId();
        
        CompanyBotSettings settings = settingsRepository.findById(companyId)
                .orElse(new CompanyBotSettings());
                
        settings.setCompanyId(companyId); 
        settings.setKnowledgeBase(payload.getKnowledgeBase());
        settings.setAdminGuardrails(payload.getAdminGuardrails());

        return ResponseEntity.ok(settingsRepository.save(settings));
    }
}