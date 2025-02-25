package com.rits.fentapco.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "opc_ua_notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // @ManyToOne
    @Column(name = "agent_id", nullable = false)
    private Long agentId; // Associated agent

    @Column(nullable = false)
    private String name; // Name of the notification for easy identification

    @Column(nullable = false)
    private String nodeId; // Node ID of the monitored tag

    @Column(nullable = false)
    private String condition; // Trigger condition (e.g., "value > 50")

    @Column(nullable = false)
    private String actionType; // Action to perform (e.g., email, log, Camel route)

    @Column
    private String email; // Email address for notifications (if actionType = "email")

    @Column
    private String routeUri; // Camel route URI (if actionType = "camelRoute")

    @Column
    private String description; // Optional description for the notification

    @Column(name = "condition_value")
    private String value;

    @Column
    private Double min;

    @Column
    private Double max;
}
