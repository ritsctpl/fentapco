/* package com.rits.fentapco.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "opc_ua_tags")
public class OpcUaTag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String tagName; // Name of the tag

    private String tagType; // Type of the tag (e.g., Integer, String, Boolean, etc.)

    private String nodeId; // Node ID associated with the tag

    @ManyToOne
    @JoinColumn(name = "opc_ua_connection_id")
    private OpcUaConnection opcUaConnection; // Reference to the connection
}
 */
package com.rits.fentapco.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "opc_ua_tags")
public class OpcUaTag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String tagName; // Name of the tag

    private String tagType; // Type of the tag (e.g., Integer, String, Boolean, etc.)

    @Column(nullable = false)
    private String nodeId; // Node ID associated with the tag

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "opc_ua_connection_id", nullable = false)
    private OpcUaConnection opcUaConnection; // Reference to the connection

    private Long notificationId;

    // @ManyToOne(fetch = FetchType.LAZY)
    // @JoinColumn(name = "agent_id") // Ensure that `agent_id` is mapped correctly
    // private Agent agent; // Reference to the associated Agent
}
