package com.gocrm.core.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/webhook")
public class WebhookController {

    // IMPORTANT: This must exactly match the string you typed into the React settings page!
    private final String VERIFY_TOKEN = "gocrm_secret_webhook_2026"; 

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
}