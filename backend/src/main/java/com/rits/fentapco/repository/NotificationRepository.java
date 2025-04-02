package com.rits.fentapco.repository;

import com.rits.fentapco.model.Notification;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    Notification findByNodeIdAndAgentId(String nodeId, Long agentId);

    // This method will auto-generate the query based on JPA naming convention
    List<Notification> findByAgentId(Long agentId);
}
