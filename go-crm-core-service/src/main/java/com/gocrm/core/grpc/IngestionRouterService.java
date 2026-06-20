package com.gocrm.core.grpc;

import io.grpc.stub.StreamObserver;
import com.gocrm.grpc.IngestionRouterGrpc;
import com.gocrm.grpc.MessageRoutingResponse;
import com.gocrm.grpc.WhatsAppMessageRequest;
import net.devh.boot.grpc.server.service.GrpcService;

@GrpcService
public class IngestionRouterService extends IngestionRouterGrpc.IngestionRouterImplBase {
    @Override
    public void forwardMessage(WhatsAppMessageRequest request, StreamObserver<MessageRoutingResponse> responseObserver) {
        System.out.println("[gRPC Server] Received High-Speed payload from WhatsApp ID: " + request.getCustomerWaId());
        System.out.println("[gRPC Server] Message Content: " + request.getRawTextBody());
        
        MessageRoutingResponse response = MessageRoutingResponse.newBuilder()
                .setSuccess(true)
                .build();

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }
}