package com.rits.fentapco.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.camel.CamelContext;
import org.apache.camel.builder.RouteBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

// not used..can be removed
//@Service
public class AgentResponseListener {

    @Autowired
    private CamelContext camelContext;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public void listenForResponse(String pcoId, String agentId, String kafkaBroker) throws Exception {
        String topic = pcoId + "-" + agentId + "-response";
        String routeId = "route-response-" + pcoId + "-" + agentId;

        camelContext.addRoutes(new RouteBuilder() {
            @Override
            public void configure() {
                from("kafka:" + topic + "?brokers=" + kafkaBroker
                        + "&groupId=rits-group&autoOffsetReset=earliest")
                        .routeId(routeId)
                        .log("📥 Received response from [" + topic + "]")
                        .process(exchange -> {
                            String message = exchange.getIn().getBody(String.class);
                            processResponse(message);
                        });
            }
        });
        System.out.println("✅ Listening for responses on: " + topic);
    }

    private void processResponse(String message) {
        try {
            JsonNode jsonNode = objectMapper.readTree(message);
            String correlationId = jsonNode.path("correlationId").asText();
            String status = jsonNode.path("status").asText();

            System.out.println("📥 Response [" + correlationId + "]: Status = " + status);
        } catch (Exception e) {
            System.err.println("❌ Error processing response: " + e.getMessage());
        }
    }
}
