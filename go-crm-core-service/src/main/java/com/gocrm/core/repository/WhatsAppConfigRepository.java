package com.gocrm.core.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gocrm.core.entity.WhatsAppConfig;

@Repository
public interface WhatsAppConfigRepository extends JpaRepository<WhatsAppConfig, Long> {
    
    Optional<WhatsAppConfig> findByCompanyId(Long companyId);
    Optional<WhatsAppConfig> findByPhoneNumberId(String phoneNumberId);
}