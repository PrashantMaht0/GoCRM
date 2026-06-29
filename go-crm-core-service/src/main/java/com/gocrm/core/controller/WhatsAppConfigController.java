package com.gocrm.core.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gocrm.core.entity.Company;
import com.gocrm.core.entity.WhatsAppConfig;
import com.gocrm.core.repository.CompanyRepository;
import com.gocrm.core.repository.UserRepository;
import com.gocrm.core.repository.WhatsAppConfigRepository;

@RestController
@RequestMapping("/api/v1/whatsapp-configs") 
public class WhatsAppConfigController {

    private final WhatsAppConfigRepository configRepository;
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository; 

    public WhatsAppConfigController(WhatsAppConfigRepository configRepository, UserRepository userRepository, CompanyRepository companyRepository) {
        this.configRepository = configRepository;
        this.userRepository = userRepository;
        this.companyRepository = companyRepository;
    }

    @PostMapping("/company/{companyId}")
    public ResponseEntity<?> saveOrUpdateConfig(@PathVariable Long companyId, @RequestBody Map<String, String> request, Authentication authentication) {
        
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

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

    @GetMapping("/company/{companyId}")
    public ResponseEntity<?> getConfig(@PathVariable Long companyId, Authentication authentication) {
        return configRepository.findByCompanyId(companyId)
                .map(config -> ResponseEntity.ok(Map.of(
                        "phoneNumberId", config.getPhoneNumberId(),
                        "wabaId", config.getWabaId(),
                        "webhookVerifyToken", config.getWebhookVerifyToken() == null ? "" : config.getWebhookVerifyToken(),
                        "accessToken", config.getAccessToken() == null ? "" : config.getAccessToken() 
                )))
                .orElse(ResponseEntity.notFound().build());
    }
}