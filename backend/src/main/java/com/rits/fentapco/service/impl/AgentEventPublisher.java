package com.rits.fentapco.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rits.fentapco.service.evaluation.AgentConditionEvaluator;
import org.apache.camel.ProducerTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.UUID;

// Not used.. can be removed
//@Service
public class AgentEventPublisher {

    @Autowired
    private AgentConditionEvaluator conditionEvaluator;

    @Autowired
    private ProducerTemplate producerTemplate;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public boolean buildAndSendEvent(String pcoId, String agentId, String apiUrl,
            Map<String, Object> requestData,
            String conditionExpression, String kafkaBroker) {
        if (!conditionEvaluator.evaluateCondition(requestData, conditionExpression)) {
            System.out.println("⚠️ Condition not met, skipping event.");
            return false;
        }

        try {
            String correlationId = UUID.randomUUID().toString();
            Map<String, Object> eventMessage = Map.of(
                    "correlationId", correlationId,
                    "pcoId", pcoId,
                    "agentId", agentId,
                    "apiUrl", apiUrl,
                    "request", requestData,
                    "method", "POST");

            String jsonMessage = objectMapper.writeValueAsString(eventMessage);
            producerTemplate.sendBody("kafka:" + pcoId + "-" + agentId + "?brokers=" + kafkaBroker, jsonMessage);

            System.out.println("📤 Sent Event: " + jsonMessage);
            return true;
        } catch (Exception e) {
            System.err.println("❌ Error sending event message: " + e.getMessage());
            return false;
        }
    }
}
