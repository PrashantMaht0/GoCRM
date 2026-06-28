package com.gocrm.core.repository;

import com.gocrm.core.entity.SupportTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {
    
    List<SupportTicket> findByCompanyIdAndTicketStatusOrderByCreatedAtDesc(Long companyId, String ticketStatus);
    List<SupportTicket> findByCompanyIdOrderByCreatedAtDesc(Long companyId);
}