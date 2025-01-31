/* package com.rits.fentapco.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "opc_ua_nodes")
public class OpcUaNode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nodeId; // Unique identifier of the node

    private String displayName; // Display name of the node

    private String browseName; // Browse name of the node

    @ManyToOne
    @JoinColumn(name = "opc_ua_connection_id")
    private OpcUaConnection opcUaConnection; // Reference to the connection
}
 */
package com.rits.fentapco.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "opc_ua_nodes")
public class OpcUaNode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nodeId; // Unique identifier of the node

    private String displayName; // Display name of the node

    private String browseName; // Browse name of the node

    @ManyToOne
    @JoinColumn(name = "opc_ua_connection_id", nullable = false)
    private OpcUaConnection opcUaConnection; // Reference to the connection
}
