package com.rits.fentapco.service.impl;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.apache.camel.ProducerTemplate;
import org.springframework.beans.factory.annotation.Autowired;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rits.fentapco.service.evaluation.AgentConditionEvaluator;

// Not used.. can be removed
//@Service
public class AgentEventPublisher {

    @Autowired
    private AgentConditionEvaluator conditionEvaluator;

    @Autowired
    private ProducerTemplate producerTemplate;

    private final ObjectMapper objectMapper = new ObjectMapper();

//     public boolean buildAndSendEvent(String pcoId, String agentId, String apiUrl,
//             Map<String, Object> requestData,
//             String conditionExpression, String kafkaBroker) {
//         if (!conditionEvaluator.evaluateCondition(requestData, conditionExpression)) {
//             System.out.println("⚠️ Condition not met, skipping event.");
//             return false;
//         }

//         try {
//             String correlationId = UUID.randomUUID().toString();
//             Map<String, Object> eventMessage = Map.of(
//                     "correlationId", correlationId,
//                     "pcoId", pcoId,
//                     "agentId", agentId,
//                     "apiUrl", apiUrl,
//                     "request", requestData,
//                     "method", "POST");

//             String jsonMessage = objectMapper.writeValueAsString(eventMessage);
//             producerTemplate.sendBody("kafka:" + pcoId + "-" + agentId + "?brokers=" + kafkaBroker, jsonMessage);

//             System.out.println("📤 Sent Event: " + jsonMessage);
//             return true;
//         } catch (Exception e) {
//             System.err.println("❌ Error sending event message: " + e.getMessage());
//             return false;
//         }
//     }
// }


public boolean buildAndSendEvent(String pcoId, String agentId, String apiUrl,
                                 Map<String, Object> requestData,
                                 String conditionExpression, String kafkaBroker) {
    Object result = conditionEvaluator.evaluate(requestData, conditionExpression);
    if (!(result instanceof Boolean && (Boolean) result) && !(result instanceof String)) {
        System.out.println("⚠️ Condition not met or invalid result type, skipping event.");
        return false;
    }

    try {
        String correlationId = UUID.randomUUID().toString();
        Map<String, Object> eventMessage = new HashMap<>();
        eventMessage.put("correlationId", correlationId);
        eventMessage.put("pcoId", pcoId);
        eventMessage.put("agentId", agentId);
        eventMessage.put("apiUrl", apiUrl);
        eventMessage.put("request", requestData);
        eventMessage.put("method", "POST");

        // Include evaluated result as message if it’s a String
        if (result instanceof String) {
            eventMessage.put("message", result);
        }

        String jsonMessage = objectMapper.writeValueAsString(eventMessage);
        String topic = pcoId + "-" + agentId;
        String kafkaUri = "kafka:" + topic + "?brokers=" + kafkaBroker;

        producerTemplate.sendBody(kafkaUri, jsonMessage);
        System.out.println("📤 Sent Event to Kafka [" + topic + "]: " + jsonMessage);
        return true;
    } catch (Exception e) {
        System.err.println("❌ Error sending event message: " + e.getMessage());
        return false;
    }
}
}