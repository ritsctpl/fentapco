/* package com.rits.fentapco.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "opc_ua_connections")
public class OpcUaConnection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; // Connection name

    @Column(nullable = false)
    private String endpointUrl; // OPC UA server endpoint URL

    private String namespaceIndex; // Namespace for browsing nodes

    private String username; // Authentication username

    private String password; // Authentication password

    private boolean active; // Connection status
}
 */
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
@Table(name = "opc_ua_connections")
public class OpcUaConnection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; // Connection name

    @Column(nullable = false)
    private String endpointUrl; // OPC UA server endpoint URL

    private String namespaceIndex; // Namespace for browsing nodes

    private String username; // Authentication username

    private String password; // Authentication password

    private boolean active; // Connection status

    // @OneToMany(mappedBy = "opcUaConnection", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    // private List<OpcUaNode> nodes; // Nodes discovered under this connection

    // @OneToMany(mappedBy = "opcUaConnection", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    // private List<OpcUaTag> tags; // Tags associated with this connection
}
