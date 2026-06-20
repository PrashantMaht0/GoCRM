package com.gocrm.ingestion.controller;

import com.gocrm.ingestion.service.GrpcDispatcherService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/webhook")
public class TestWebhookController {

    private final GrpcDispatcherService dispatcherService;

    public TestWebhookController(GrpcDispatcherService dispatcherService) {
        this.dispatcherService = dispatcherService;
    }

    // A simple GET request to trigger our gRPC bridge manually
    @GetMapping("/test-grpc")
    public String testBridge(
            @RequestParam(defaultValue = "15551234567") String phone,
            @RequestParam(defaultValue = "I need a status update on my CRM ticket") String message) {
        
        return dispatcherService.sendMockMessageToCore(phone, message);
    }
}