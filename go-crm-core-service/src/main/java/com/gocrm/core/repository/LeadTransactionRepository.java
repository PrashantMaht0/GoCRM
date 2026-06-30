package com.gocrm.core.repository;

import com.gocrm.core.entity.LeadTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;

@Repository
public interface LeadTransactionRepository extends JpaRepository<LeadTransaction, Long> {
    
    List<LeadTransaction> findByCompanyIdAndClosedAtBetween(Long companyId, ZonedDateTime start, ZonedDateTime end);
    
    List<LeadTransaction> findByCompanyId(Long companyId);
}