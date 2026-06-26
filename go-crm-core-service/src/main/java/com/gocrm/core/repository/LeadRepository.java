package com.gocrm.core.repository;

import com.gocrm.core.entity.Lead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LeadRepository extends JpaRepository<Lead, Long> {

    Optional<Lead> findByCompanyIdAndWhatsappId(Long companyId, String whatsappId);
    List<Lead> findByCompanyIdOrderByCreatedAtDesc(Long companyId);
}