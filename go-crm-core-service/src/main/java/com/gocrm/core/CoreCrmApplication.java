package com.gocrm.core;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import net.devh.boot.grpc.server.autoconfigure.GrpcServerSecurityAutoConfiguration;

@SpringBootApplication(exclude={GrpcServerSecurityAutoConfiguration.class})
public class CoreCrmApplication {
    public static void main(String[] args) {
        SpringApplication.run(CoreCrmApplication.class, args);
    }
}