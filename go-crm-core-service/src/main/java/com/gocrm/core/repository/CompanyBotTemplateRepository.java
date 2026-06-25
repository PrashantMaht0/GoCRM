package com.gocrm.core.repository;

import com.gocrm.core.entity.CompanyBotTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CompanyBotTemplateRepository extends JpaRepository<CompanyBotTemplate, Long> {
    List<CompanyBotTemplate> findByCompanyId(Long companyId);
}