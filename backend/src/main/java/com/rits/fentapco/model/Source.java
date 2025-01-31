package com.rits.fentapco.model;

import jakarta.persistence.*;
import lombok.Data;

@Data 
@Entity
@Table(name = "sources")
public class Source {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; // Human-readable name of the source

    @Column(nullable = false)
    private String type; // Type of the source (e.g., OPC UA, MQTT, Kafka)

    @Column(nullable = false)
    private String endpointUrl; // URL or address of the source (e.g., opc.tcp://localhost:4840)

    @Column
    private String username; // Username for authentication, if required

    @Column
    private String password; // Password for authentication, if required

    @Column
    private String securityMode; // Security mode for OPC UA (optional, e.g., "None", "Sign", "SignAndEncrypt")

    @Column
    private String securityPolicy; // Security policy for OPC UA (optional, e.g., "Basic256Sha256")

    @ManyToOne
    @JoinColumn(name = "opc_ua_connection_id")
    private OpcUaConnection opcUaConnection;

}
