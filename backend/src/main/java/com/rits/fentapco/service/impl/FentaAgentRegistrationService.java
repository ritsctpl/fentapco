package com.rits.fentapco.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rits.fentapco.util.CorrelationIdGenerator;
import org.apache.camel.ProducerTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class FentaAgentRegistrationService {

    @Autowired
    private ProducerTemplate producerTemplate;

    @Autowired
    private ObjectMapper objectMapper; // ✅ Inject Jackson mapper

    public String registerAgent(String pcoId, String agentId, String username, String status, String kafkaBrokers) {
        String correlationId = CorrelationIdGenerator.generateCorrelationId();

        Map<String, Object> registrationMessage = Map.of(
                "correlationId", correlationId,
                "pcoId", pcoId,
                "agentId", agentId,
                "username", username,
                "status", status);

        String kafkaUri = "kafka:fenta-pco-agent?brokers=" + kafkaBrokers;

        try {
            String jsonMessage = objectMapper.writeValueAsString(registrationMessage);
            producerTemplate.sendBody(kafkaUri, jsonMessage); // ✅ Send as JSON string
            System.out.println("🔥 Registration event [" + status + "] sent for agent: " + agentId);
            return correlationId;
        } catch (Exception e) {
            System.err.println("❌ Failed to serialize registration message: " + e.getMessage());
            throw new RuntimeException("Failed to serialize registration message", e);
        }
    }
}
