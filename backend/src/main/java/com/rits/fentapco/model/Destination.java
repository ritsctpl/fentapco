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
@Table(name = "destination")
public class Destination {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String protocol; // HTTP, MQTT, OPC UA, Kafka
    private String apiUrl;
    private String methodType; // POST, GET, PUT, DELETE
    private String headers;
    private String bodyTemplate; // Template for request body (JSON format)

    private String authenticationType; // NONE, BASIC, BEARER
    private String username;
    private String password;
    private String bearerToken;

    // 🔹 New Kafka-specific properties
    @Column(name = "kafka_brokers")
    private String kafkaBrokers; // ✅ New Field for Kafka Brokers
    private String kafkaTopic; // Kafka topic to send messages

    private String pcoId;
    private boolean active;
}
