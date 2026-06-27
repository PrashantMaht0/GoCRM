package com.gocrm.core.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "aiTaskExecutor")
    public Executor aiTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2); // Keep 2 threads ready
        executor.setMaxPoolSize(10); // Scale up to 10 if there's a spike in handovers
        executor.setQueueCapacity(50); // Queue up to 50 requests before rejecting
        executor.setThreadNamePrefix("AI-Worker-");
        executor.initialize();
        return executor;
    }
}