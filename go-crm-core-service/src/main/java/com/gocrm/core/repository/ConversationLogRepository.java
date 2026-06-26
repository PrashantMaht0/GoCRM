package com.gocrm.core.repository;

import com.gocrm.core.entity.ConversationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConversationLogRepository extends JpaRepository<ConversationLog, Long> {

    boolean existsByWamid(String wamid);
    List<ConversationLog> findByLeadIdOrderByCreatedAtAsc(Long leadId);
}