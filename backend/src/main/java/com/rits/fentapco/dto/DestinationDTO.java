package com.rits.fentapco.dto;

import com.rits.fentapco.model.Destination;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DestinationDTO {
    private Long id;
    private String name;
    private String protocol;
    private String apiUrl;
    private String methodType;
    private String headers;
    private String bodyTemplate;
    private String authenticationType;
    private String username;
    private String password;
    private String bearerToken;
    private boolean active;

    // 🔹 New Kafka properties
    private String kafkaBrokers; // ✅ New Field for Kafka Brokers
    private String kafkaTopic;

    // ✅ Additional Constructor for Kafka-based Destination
    public DestinationDTO(Long id, String name, String protocol, String kafkaBrokers) {
        this.id = id;
        this.name = name;
        this.protocol = protocol;
        this.kafkaBrokers = kafkaBrokers;
    }

    public Destination toEntity() {
        Destination entity = new Destination();
        entity.setId(this.id);
        entity.setName(this.name);
        entity.setProtocol(this.protocol);
        entity.setKafkaBrokers(this.kafkaBrokers); // ✅ Ensure this line exists
        entity.setActive(this.active);
        return entity;
    }

    public static DestinationDTO fromEntity(Destination entity) {
        DestinationDTO dto = new DestinationDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setProtocol(entity.getProtocol());
        dto.setKafkaBrokers(entity.getKafkaBrokers()); // ✅ Ensure this line exists
        dto.setActive(entity.isActive());
        return dto;
    }
}
