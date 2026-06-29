package com.gocrm.core.repository;

import com.gocrm.core.entity.LeadRequirement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LeadRequirementRepository extends JpaRepository<LeadRequirement, Long> {
    Optional<LeadRequirement> findByLeadId(Long leadId);
}