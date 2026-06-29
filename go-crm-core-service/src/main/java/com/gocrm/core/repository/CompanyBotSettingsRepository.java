package com.gocrm.core.repository;

import com.gocrm.core.entity.CompanyBotSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CompanyBotSettingsRepository extends JpaRepository<CompanyBotSettings, Long> {
    // Because companyId is the ID, standard findById(companyId) works perfectly!
}