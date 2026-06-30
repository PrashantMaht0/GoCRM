package com.gocrm.core.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.gocrm.core.entity.WhatsAppConfig;
import com.gocrm.core.repository.WhatsAppConfigRepository;
import com.gocrm.core.service.WhatsAppService;

@RestController
@RequestMapping("/api/v1/webhook")
public class WebhookController {

    private final WhatsAppService whatsappService;
    private final WhatsAppConfigRepository waConfigRepository;

    public WebhookController(WhatsAppService whatsAppService, WhatsAppConfigRepository waConfigRepository) {
        this.whatsappService = whatsAppService;
        this.waConfigRepository = waConfigRepository;
    }
    @GetMapping
    public ResponseEntity<String> verifyWebhook(
            @RequestParam(name = "hub.mode", required = false) String mode,
            @RequestParam(name = "hub.verify_token", required = false) String token,
            @RequestParam(name = "hub.challenge", required = false) String challenge) {
        
        WhatsAppConfig activeConfig = waConfigRepository.findAll().stream().findFirst().orElse(null);

        if ("subscribe".equals(mode) && activeConfig != null && activeConfig.getWebhookVerifyToken() != null && activeConfig.getWebhookVerifyToken().equals(token)) {
            System.out.println("Meta Webhook verified successfully!");
            // You MUST return the challenge string exactly as Meta sent it
            return ResponseEntity.ok(challenge);
        } else {
            System.out.println("Failed verification. Expected: " + activeConfig.getWebhookVerifyToken() + " but got: " + token);
            return ResponseEntity.status(403).body("Verification failed");
        }
    }

    @PostMapping
    public ResponseEntity<String> receiveWhatsAppMessage(@RequestBody String payload) {
        
        System.out.println("\n--- INCOMING WHATSAPP MESSAGE ---");
        System.out.println(payload);
        System.out.println("---------------------------------\n");
        
        whatsappService.processIncomingMessage(payload);
        return ResponseEntity.ok("EVENT_RECEIVED");
    }

    
}