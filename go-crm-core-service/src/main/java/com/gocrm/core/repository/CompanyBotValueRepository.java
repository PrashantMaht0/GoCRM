package com.gocrm.core.repository;

import com.gocrm.core.entity.CompanyBotValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyBotValueRepository extends JpaRepository<CompanyBotValue, Long> {
    // Find all saved values for a specific company
    List<CompanyBotValue> findByCompanyId(Long companyId);
    
    // Find a specific value (e.g., just the guardrails) for a company
    Optional<CompanyBotValue> findByCompanyIdAndTemplateId(Long companyId, Long templateId);
}