package com.gocrm.grpc;

import static io.grpc.MethodDescriptor.generateFullMethodName;

/**
 */
@javax.annotation.Generated(
    value = "by gRPC proto compiler (version 1.62.2)",
    comments = "Source: whatsapp.proto")
@io.grpc.stub.annotations.GrpcGenerated
public final class IngestionRouterGrpc {

  private IngestionRouterGrpc() {}

  public static final java.lang.String SERVICE_NAME = "whatsapp.IngestionRouter";

  // Static method descriptors that strictly reflect the proto.
  private static volatile io.grpc.MethodDescriptor<com.gocrm.grpc.WhatsAppMessageRequest,
      com.gocrm.grpc.MessageRoutingResponse> getForwardMessageMethod;

  @io.grpc.stub.annotations.RpcMethod(
      fullMethodName = SERVICE_NAME + '/' + "ForwardMessage",
      requestType = com.gocrm.grpc.WhatsAppMessageRequest.class,
      responseType = com.gocrm.grpc.MessageRoutingResponse.class,
      methodType = io.grpc.MethodDescriptor.MethodType.UNARY)
  public static io.grpc.MethodDescriptor<com.gocrm.grpc.WhatsAppMessageRequest,
      com.gocrm.grpc.MessageRoutingResponse> getForwardMessageMethod() {
    io.grpc.MethodDescriptor<com.gocrm.grpc.WhatsAppMessageRequest, com.gocrm.grpc.MessageRoutingResponse> getForwardMessageMethod;
    if ((getForwardMessageMethod = IngestionRouterGrpc.getForwardMessageMethod) == null) {
      synchronized (IngestionRouterGrpc.class) {
        if ((getForwardMessageMethod = IngestionRouterGrpc.getForwardMessageMethod) == null) {
          IngestionRouterGrpc.getForwardMessageMethod = getForwardMessageMethod =
              io.grpc.MethodDescriptor.<com.gocrm.grpc.WhatsAppMessageRequest, com.gocrm.grpc.MessageRoutingResponse>newBuilder()
              .setType(io.grpc.MethodDescriptor.MethodType.UNARY)
              .setFullMethodName(generateFullMethodName(SERVICE_NAME, "ForwardMessage"))
              .setSampledToLocalTracing(true)
              .setRequestMarshaller(io.grpc.protobuf.ProtoUtils.marshaller(
                  com.gocrm.grpc.WhatsAppMessageRequest.getDefaultInstance()))
              .setResponseMarshaller(io.grpc.protobuf.ProtoUtils.marshaller(
                  com.gocrm.grpc.MessageRoutingResponse.getDefaultInstance()))
              .setSchemaDescriptor(new IngestionRouterMethodDescriptorSupplier("ForwardMessage"))
              .build();
        }
      }
    }
    return getForwardMessageMethod;
  }

  /**
   * Creates a new async stub that supports all call types for the service
   */
  public static IngestionRouterStub newStub(io.grpc.Channel channel) {
    io.grpc.stub.AbstractStub.StubFactory<IngestionRouterStub> factory =
      new io.grpc.stub.AbstractStub.StubFactory<IngestionRouterStub>() {
        @java.lang.Override
        public IngestionRouterStub newStub(io.grpc.Channel channel, io.grpc.CallOptions callOptions) {
          return new IngestionRouterStub(channel, callOptions);
        }
      };
    return IngestionRouterStub.newStub(factory, channel);
  }

  /**
   * Creates a new blocking-style stub that supports unary and streaming output calls on the service
   */
  public static IngestionRouterBlockingStub newBlockingStub(
      io.grpc.Channel channel) {
    io.grpc.stub.AbstractStub.StubFactory<IngestionRouterBlockingStub> factory =
      new io.grpc.stub.AbstractStub.StubFactory<IngestionRouterBlockingStub>() {
        @java.lang.Override
        public IngestionRouterBlockingStub newStub(io.grpc.Channel channel, io.grpc.CallOptions callOptions) {
          return new IngestionRouterBlockingStub(channel, callOptions);
        }
      };
    return IngestionRouterBlockingStub.newStub(factory, channel);
  }

  /**
   * Creates a new ListenableFuture-style stub that supports unary calls on the service
   */
  public static IngestionRouterFutureStub newFutureStub(
      io.grpc.Channel channel) {
    io.grpc.stub.AbstractStub.StubFactory<IngestionRouterFutureStub> factory =
      new io.grpc.stub.AbstractStub.StubFactory<IngestionRouterFutureStub>() {
        @java.lang.Override
        public IngestionRouterFutureStub newStub(io.grpc.Channel channel, io.grpc.CallOptions callOptions) {
          return new IngestionRouterFutureStub(channel, callOptions);
        }
      };
    return IngestionRouterFutureStub.newStub(factory, channel);
  }

  /**
   */
  public interface AsyncService {

    /**
     */
    default void forwardMessage(com.gocrm.grpc.WhatsAppMessageRequest request,
        io.grpc.stub.StreamObserver<com.gocrm.grpc.MessageRoutingResponse> responseObserver) {
      io.grpc.stub.ServerCalls.asyncUnimplementedUnaryCall(getForwardMessageMethod(), responseObserver);
    }
  }

  /**
   * Base class for the server implementation of the service IngestionRouter.
   */
  public static abstract class IngestionRouterImplBase
      implements io.grpc.BindableService, AsyncService {

    @java.lang.Override public final io.grpc.ServerServiceDefinition bindService() {
      return IngestionRouterGrpc.bindService(this);
    }
  }

  /**
   * A stub to allow clients to do asynchronous rpc calls to service IngestionRouter.
   */
  public static final class IngestionRouterStub
      extends io.grpc.stub.AbstractAsyncStub<IngestionRouterStub> {
    private IngestionRouterStub(
        io.grpc.Channel channel, io.grpc.CallOptions callOptions) {
      super(channel, callOptions);
    }

    @java.lang.Override
    protected IngestionRouterStub build(
        io.grpc.Channel channel, io.grpc.CallOptions callOptions) {
      return new IngestionRouterStub(channel, callOptions);
    }

    /**
     */
    public void forwardMessage(com.gocrm.grpc.WhatsAppMessageRequest request,
        io.grpc.stub.StreamObserver<com.gocrm.grpc.MessageRoutingResponse> responseObserver) {
      io.grpc.stub.ClientCalls.asyncUnaryCall(
          getChannel().newCall(getForwardMessageMethod(), getCallOptions()), request, responseObserver);
    }
  }

  /**
   * A stub to allow clients to do synchronous rpc calls to service IngestionRouter.
   */
  public static final class IngestionRouterBlockingStub
      extends io.grpc.stub.AbstractBlockingStub<IngestionRouterBlockingStub> {
    private IngestionRouterBlockingStub(
        io.grpc.Channel channel, io.grpc.CallOptions callOptions) {
      super(channel, callOptions);
    }

    @java.lang.Override
    protected IngestionRouterBlockingStub build(
        io.grpc.Channel channel, io.grpc.CallOptions callOptions) {
      return new IngestionRouterBlockingStub(channel, callOptions);
    }

    /**
     */
    public com.gocrm.grpc.MessageRoutingResponse forwardMessage(com.gocrm.grpc.WhatsAppMessageRequest request) {
      return io.grpc.stub.ClientCalls.blockingUnaryCall(
          getChannel(), getForwardMessageMethod(), getCallOptions(), request);
    }
  }

  /**
   * A stub to allow clients to do ListenableFuture-style rpc calls to service IngestionRouter.
   */
  public static final class IngestionRouterFutureStub
      extends io.grpc.stub.AbstractFutureStub<IngestionRouterFutureStub> {
    private IngestionRouterFutureStub(
        io.grpc.Channel channel, io.grpc.CallOptions callOptions) {
      super(channel, callOptions);
    }

    @java.lang.Override
    protected IngestionRouterFutureStub build(
        io.grpc.Channel channel, io.grpc.CallOptions callOptions) {
      return new IngestionRouterFutureStub(channel, callOptions);
    }

    /**
     */
    public com.google.common.util.concurrent.ListenableFuture<com.gocrm.grpc.MessageRoutingResponse> forwardMessage(
        com.gocrm.grpc.WhatsAppMessageRequest request) {
      return io.grpc.stub.ClientCalls.futureUnaryCall(
          getChannel().newCall(getForwardMessageMethod(), getCallOptions()), request);
    }
  }

  private static final int METHODID_FORWARD_MESSAGE = 0;

  private static final class MethodHandlers<Req, Resp> implements
      io.grpc.stub.ServerCalls.UnaryMethod<Req, Resp>,
      io.grpc.stub.ServerCalls.ServerStreamingMethod<Req, Resp>,
      io.grpc.stub.ServerCalls.ClientStreamingMethod<Req, Resp>,
      io.grpc.stub.ServerCalls.BidiStreamingMethod<Req, Resp> {
    private final AsyncService serviceImpl;
    private final int methodId;

    MethodHandlers(AsyncService serviceImpl, int methodId) {
      this.serviceImpl = serviceImpl;
      this.methodId = methodId;
    }

    @java.lang.Override
    @java.lang.SuppressWarnings("unchecked")
    public void invoke(Req request, io.grpc.stub.StreamObserver<Resp> responseObserver) {
      switch (methodId) {
        case METHODID_FORWARD_MESSAGE:
          serviceImpl.forwardMessage((com.gocrm.grpc.WhatsAppMessageRequest) request,
              (io.grpc.stub.StreamObserver<com.gocrm.grpc.MessageRoutingResponse>) responseObserver);
          break;
        default:
          throw new AssertionError();
      }
    }

    @java.lang.Override
    @java.lang.SuppressWarnings("unchecked")
    public io.grpc.stub.StreamObserver<Req> invoke(
        io.grpc.stub.StreamObserver<Resp> responseObserver) {
      switch (methodId) {
        default:
          throw new AssertionError();
      }
    }
  }

  public static final io.grpc.ServerServiceDefinition bindService(AsyncService service) {
    return io.grpc.ServerServiceDefinition.builder(getServiceDescriptor())
        .addMethod(
          getForwardMessageMethod(),
          io.grpc.stub.ServerCalls.asyncUnaryCall(
            new MethodHandlers<
              com.gocrm.grpc.WhatsAppMessageRequest,
              com.gocrm.grpc.MessageRoutingResponse>(
                service, METHODID_FORWARD_MESSAGE)))
        .build();
  }

  private static abstract class IngestionRouterBaseDescriptorSupplier
      implements io.grpc.protobuf.ProtoFileDescriptorSupplier, io.grpc.protobuf.ProtoServiceDescriptorSupplier {
    IngestionRouterBaseDescriptorSupplier() {}

    @java.lang.Override
    public com.google.protobuf.Descriptors.FileDescriptor getFileDescriptor() {
      return com.gocrm.grpc.Whatsapp.getDescriptor();
    }

    @java.lang.Override
    public com.google.protobuf.Descriptors.ServiceDescriptor getServiceDescriptor() {
      return getFileDescriptor().findServiceByName("IngestionRouter");
    }
  }

  private static final class IngestionRouterFileDescriptorSupplier
      extends IngestionRouterBaseDescriptorSupplier {
    IngestionRouterFileDescriptorSupplier() {}
  }

  private static final class IngestionRouterMethodDescriptorSupplier
      extends IngestionRouterBaseDescriptorSupplier
      implements io.grpc.protobuf.ProtoMethodDescriptorSupplier {
    private final java.lang.String methodName;

    IngestionRouterMethodDescriptorSupplier(java.lang.String methodName) {
      this.methodName = methodName;
    }

    @java.lang.Override
    public com.google.protobuf.Descriptors.MethodDescriptor getMethodDescriptor() {
      return getServiceDescriptor().findMethodByName(methodName);
    }
  }

  private static volatile io.grpc.ServiceDescriptor serviceDescriptor;

  public static io.grpc.ServiceDescriptor getServiceDescriptor() {
    io.grpc.ServiceDescriptor result = serviceDescriptor;
    if (result == null) {
      synchronized (IngestionRouterGrpc.class) {
        result = serviceDescriptor;
        if (result == null) {
          serviceDescriptor = result = io.grpc.ServiceDescriptor.newBuilder(SERVICE_NAME)
              .setSchemaDescriptor(new IngestionRouterFileDescriptorSupplier())
              .addMethod(getForwardMessageMethod())
              .build();
        }
      }
    }
    return result;
  }
}
