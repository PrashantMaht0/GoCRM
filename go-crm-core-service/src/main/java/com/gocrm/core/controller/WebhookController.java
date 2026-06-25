package com.gocrm.core.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.gocrm.core.service.WhatsAppService;

@RestController
@RequestMapping("/api/v1/webhook")
public class WebhookController {

    // IMPORTANT: This must exactly match the string you typed into the React settings page!
    private final String VERIFY_TOKEN = "gocrm_secret_webhook_2026"; 
    private final WhatsAppService whatsappService;

    public WebhookController(WhatsAppService whatsAppService) {
        this.whatsappService = whatsAppService;
    }
    @GetMapping
    public ResponseEntity<String> verifyWebhook(
            @RequestParam(name = "hub.mode", required = false) String mode,
            @RequestParam(name = "hub.verify_token", required = false) String token,
            @RequestParam(name = "hub.challenge", required = false) String challenge) {

        if ("subscribe".equals(mode) && VERIFY_TOKEN.equals(token)) {
            System.out.println("Meta Webhook verified successfully!");
            // You MUST return the challenge string exactly as Meta sent it
            return ResponseEntity.ok(challenge);
        } else {
            System.out.println("Failed verification. Expected: " + VERIFY_TOKEN + " but got: " + token);
            return ResponseEntity.status(403).body("Verification failed");
        }
    }

    // Meta sends a POST request here whenever a customer messages your bot
    @PostMapping
    public ResponseEntity<String> receiveWhatsAppMessage(@RequestBody String payload) {
        
        System.out.println("\n--- INCOMING WHATSAPP MESSAGE ---");
        System.out.println(payload);
        System.out.println("---------------------------------\n");

        // IMPORTANT: You must always return a 200 OK immediately, 
        // otherwise Meta will think your server is dead and keep retrying.
        whatsappService.processIncomingMessage(payload);
        return ResponseEntity.ok("EVENT_RECEIVED");
    }

    
}