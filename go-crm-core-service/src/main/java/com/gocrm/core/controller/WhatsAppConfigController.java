package com.gocrm.core.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gocrm.core.entity.Company;
import com.gocrm.core.entity.User;
import com.gocrm.core.entity.WhatsAppConfig;
import com.gocrm.core.repository.UserRepository;
import com.gocrm.core.repository.WhatsAppConfigRepository;

@RestController
@RequestMapping("/api/v1/whatsapp-config")
public class WhatsAppConfigController {

    private final WhatsAppConfigRepository configRepository;
    private final UserRepository userRepository;

    public WhatsAppConfigController(WhatsAppConfigRepository configRepository, UserRepository userRepository) {
        this.configRepository = configRepository;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<?> saveOrUpdateConfig(@RequestBody Map<String, String> request, Authentication authentication) {
        
        String userEmail = authentication.getName();
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Company company = currentUser.getCompany();

        Optional<WhatsAppConfig> existingConfig = configRepository.findByCompanyId(company.getId());
        WhatsAppConfig config = existingConfig.orElseGet(WhatsAppConfig::new);

        config.setCompany(company);
        config.setPhoneNumberId(request.get("phoneNumberId"));
        config.setWabaId(request.get("wabaId"));
        config.setAccessToken(request.get("accessToken"));
        config.setWebhookVerifyToken(request.get("webhookVerifyToken"));
        config.setActive(true); 
        configRepository.save(config);

        return ResponseEntity.ok(Map.of(
                "message", "WhatsApp configuration saved successfully!",
                "isActive", config.isActive()
        ));
    }

    @GetMapping
    public ResponseEntity<?> getConfig(Authentication authentication) {
        String userEmail = authentication.getName();
        User currentUser = userRepository.findByEmail(userEmail).orElseThrow();
        
        return configRepository.findByCompanyId(currentUser.getCompany().getId())
                .map(config -> ResponseEntity.ok(Map.of(
                        "phoneNumberId", config.getPhoneNumberId(),
                        "wabaId", config.getWabaId(),
                        "webhookVerifyToken", config.getWebhookVerifyToken(),
                        "accessToken", "********" 
                )))
                .orElse(ResponseEntity.notFound().build());
    }
}