package com.gocrm.core.repository;

import com.gocrm.core.entity.ChatSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChatSummaryRepository extends JpaRepository<ChatSummary, Long> {
    Optional<ChatSummary> findByLeadId(Long leadId);
}