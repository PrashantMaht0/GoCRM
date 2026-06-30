package com.gocrm.core.repository;

import com.gocrm.core.entity.TicketResolution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TicketResolutionRepository extends JpaRepository<TicketResolution, Long> {
    long countByResolvedByUserId(Long userId);
}