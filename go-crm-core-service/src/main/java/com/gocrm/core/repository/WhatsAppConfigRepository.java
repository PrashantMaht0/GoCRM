package com.gocrm.core.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gocrm.core.entity.WhatsAppConfig;

@Repository
public interface WhatsAppConfigRepository extends JpaRepository<WhatsAppConfig, Long> {
    
    // Crucial for looking up tokens based on the company
    Optional<WhatsAppConfig> findByCompanyId(Long companyId);
    
    // Crucial for the ingestion service validating incoming webhooks
    Optional<WhatsAppConfig> findByPhoneNumberId(String phoneNumberId);
}