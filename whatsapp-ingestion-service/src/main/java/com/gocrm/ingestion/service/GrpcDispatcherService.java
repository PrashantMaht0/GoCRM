package com.gocrm.ingestion.service;

import com.gocrm.grpc.IngestionRouterGrpc;
import com.gocrm.grpc.MessageRoutingResponse;
import com.gocrm.grpc.WhatsAppMessageRequest;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.springframework.stereotype.Service;

@Service
public class GrpcDispatcherService {

    @GrpcClient("core-service")
    private IngestionRouterGrpc.IngestionRouterBlockingStub routerStub;

    public String sendMockMessageToCore(String customerNumber, String message) {
        System.out.println("[Ingestion Edge] Preparing to fire gRPC payload to Core...");
        
        WhatsAppMessageRequest request = WhatsAppMessageRequest.newBuilder()
                .setPhoneNumberId("mock-company-123")
                .setCustomerWaId(customerNumber)
                .setRawTextBody(message)
                .setWamid("wamid." + System.currentTimeMillis())
                .build();

        MessageRoutingResponse response = routerStub.forwardMessage(request);
        
        if (response.getSuccess()) {
            return "gRPC Transmission Successful! Core Service acknowledged.";
        } else {
            return "gRPC Transmission Failed: " + response.getErrorMessage();
        }
    }
}