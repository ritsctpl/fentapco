// package com.rits.fentapco.service.impl;

// import com.fasterxml.jackson.databind.ObjectMapper;

// import jakarta.annotation.PostConstruct;

// import org.apache.camel.builder.RouteBuilder;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.stereotype.Service;
// import org.apache.camel.CamelContext;

// import java.util.Map;
// import java.util.concurrent.ConcurrentHashMap;

// @Service
// public class FentaAgentResponseListener {

//     @Autowired
//     private CamelContext camelContext;

//     private final ConcurrentHashMap<String, String> responseStore = new ConcurrentHashMap<>();
//     private final ObjectMapper objectMapper = new ObjectMapper();

//     @PostConstruct
//     public void init() throws Exception {
//         camelContext.addRoutes(new RouteBuilder() {
//             @Override
//             public void configure() {
//                 from("kafka:fenta-pco-agent-response?groupId=fenta-agent-group")
//                         .routeId("fenta-agent-response-listener")
//                         .process(exchange -> {
//                             String body = exchange.getIn().getBody(String.class);
//                             Map<?, ?> response = objectMapper.readValue(body, Map.class);
//                             String correlationId = (String) response.get("correlationId");
//                             responseStore.put(correlationId, body);
//                             System.out.println("✅ Response received: correlationId=" + correlationId);
//                         });
//             }
//         });
//     }

//     public String getResponse(String correlationId) {
//         return responseStore.get(correlationId);
//     }
// }
// package com.rits.fentapco.service.impl;

// import com.fasterxml.jackson.databind.ObjectMapper;
// import com.rits.fentapco.model.Destination;
// import com.rits.fentapco.repository.DestinationRepository;

// import jakarta.annotation.PostConstruct;

// import org.apache.camel.builder.RouteBuilder;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.stereotype.Service;
// import org.apache.camel.CamelContext;

// import java.util.Map;
// import java.util.concurrent.ConcurrentHashMap;

// @Service
// public class FentaAgentResponseListener {

//     @Autowired
//     private CamelContext camelContext;

//     @Autowired
//     private DestinationRepository destinationRepository;

//     private final ConcurrentHashMap<String, Boolean> registrationStatus = new ConcurrentHashMap<>();
//     private final ObjectMapper objectMapper = new ObjectMapper();

//     // Start listener dynamically
//     public void startListener() throws Exception {
//         String routeId = "route-fenta-agent-response";

//         Destination kafkaDestination = destinationRepository.findByName("FentaKafka");
//         if (kafkaDestination == null || kafkaDestination.getKafkaBrokers() == null) {
//             throw new RuntimeException("❌ Kafka broker not configured in destination table.");
//         }

//         String kafkaBrokers = kafkaDestination.getKafkaBrokers();

//         if (camelContext.getRoute(routeId) != null) {
//             camelContext.getRouteController().stopRoute(routeId);
//             camelContext.removeRoute(routeId);
//         }

//         camelContext.addRoutes(new RouteBuilder() {
//             @Override
//             public void configure() {
//                 from("kafka:fenta-pco-agent-response?brokers=" + kafkaBrokers + "&groupId=fenta-agent-group")
//                         .routeId(routeId)
//                         .log("📥 Response from fenta-pco-agent-response: ${body}")
//                         .process(exchange -> {
//                             String message = exchange.getIn().getBody(String.class);
//                             Map<?, ?> response = objectMapper.readValue(message, Map.class);
//                             String correlationId = (String) response.get("correlationId");
//                             boolean registered = Boolean.parseBoolean(response.get("registered").toString());
//                             registrationStatus.put(correlationId, registered);
//                             System.out.println("✅ Agent registration status: " + correlationId + " = " + registered);
//                         });
//             }
//         });

//         camelContext.getRouteController().startRoute(routeId);
//         System.out.println("🚀 Listener route dynamically started.");
//     }

//     // Check if Agent registered
//     public boolean isAgentRegistered(String correlationId) {
//         return registrationStatus.getOrDefault(correlationId, false);
//     }

//     // Stop listener dynamically
//     public void stopListener() throws Exception {
//         String routeId = "route-fenta-agent-response";
//         if (camelContext.getRoute(routeId) != null) {
//             camelContext.getRouteController().stopRoute(routeId);
//             camelContext.removeRoute(routeId);
//             System.out.println("🛑 Listener route dynamically stopped.");
//         }
//     }
// }
package com.rits.fentapco.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rits.fentapco.model.Destination;
import com.rits.fentapco.model.Notification;
import com.rits.fentapco.repository.DestinationRepository;
import com.rits.fentapco.repository.NotificationRepository;
import jakarta.annotation.PostConstruct;
import org.apache.camel.builder.RouteBuilder;
import org.apache.camel.CamelContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class FentaAgentResponseListener {

    @Autowired
    private CamelContext camelContext;

    @Autowired
    private DestinationRepository destinationRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private NotificationRouteBuilder notificationRouteBuilder;

    private static final String ROUTE_ID = "route-fenta-agent-response";

    @PostConstruct
    public void init() {
        try {
            List<Destination> fentaDestinations = destinationRepository.findByProtocol("FENTA");

            if (!fentaDestinations.isEmpty()) {
                startListener(fentaDestinations.get(0).getKafkaBrokers());
            }
        } catch (Exception e) {
            System.err.println("❌ Error starting FENTA response listener at startup: " + e.getMessage());
        }
    }

    public synchronized void startListener(String kafkaBrokers) throws Exception {
        if (camelContext.getRoute(ROUTE_ID) != null) {
            return; // Already started
        }

        if (kafkaBrokers == null || kafkaBrokers.isBlank()) {
            throw new RuntimeException("❌ Kafka brokers not configured for FENTA");
        }

        camelContext.addRoutes(new RouteBuilder() {
            @Override
            public void configure() {
                from("kafka:fenta-pco-agent-response?brokers=" + kafkaBrokers + "&groupId=fenta-agent-group")
                        .routeId(ROUTE_ID)
                        .log("📥 FENTA Response: ${body}")
                        .process(exchange -> {
                            String message = exchange.getIn().getBody(String.class);
                            Map<?, ?> response = objectMapper.readValue(message, Map.class);
                            String correlationId = (String) response.get("correlationId");
                            String agentId = (String) response.get("agentId");

                            Notification notification = notificationRepository.findById(Long.parseLong(agentId))
                                    .orElse(null);
                            if (notification != null) {
                                notification.setStatus(correlationId + "-registered");
                                notificationRepository.save(notification);
                                System.out.println("✅ Notification [" + agentId + "] marked as registered.");

                                // 🟢 Register the notification Camel route dynamically
                                if (camelContext.getRoute("notification-" + agentId) == null) {
                                    notificationRouteBuilder.addRouteForNotification(notification, camelContext);
                                    System.out.println("🔄 Camel route registered for notification: " + agentId);
                                }

                            } else {
                                System.out.println("⚠ No matching notification for agentId: " + agentId);
                            }
                        });
            }
        });

        camelContext.getRouteController().startRoute(ROUTE_ID);
        System.out.println("🚀 FENTA response listener started with brokers: " + kafkaBrokers);
    }
}
