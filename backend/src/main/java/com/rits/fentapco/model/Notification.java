package com.rits.fentapco.model;

import java.util.Map;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapKeyColumn;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
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

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "destination_id", nullable = false)
    private Destination destination; // Destination details

    @Transient
    private Map<String, Object> inputData;

    @Column(name = "api_url")
    private String apiUrl;

    private String name; // Name of the notification for easy identification

    private String nodeId; // Node ID of the monitored tag

    private String condition; // Trigger condition (e.g., "value > 50")

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

    @Column(name = "status")
    private String status;

    // ✅ NEW: Template for Kafka message
    @Column(name = "message_template", columnDefinition = "TEXT")
    private String messageTemplate;

    // ✅ NEW: Tag alias to nodeId mapping (e.g., {"fanSpeed":"ns=1;s=..."})
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "notification_tag_alias_map", joinColumns = @JoinColumn(name = "notification_id"))
    @MapKeyColumn(name = "alias")
    @Column(name = "node_id")
    private Map<String, String> tagAliasMap;
}
