package com.rits.fentapco.configuration;

import com.rits.fentapco.model.Destination;
import com.rits.fentapco.repository.DestinationRepository;
import org.apache.camel.CamelContext;
import org.apache.camel.builder.RouteBuilder;
import org.apache.camel.impl.engine.AbstractCamelContext;
import org.apache.camel.support.RoutePolicySupport;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;

@Component
public class KafkaRouteInitializer {

    @Autowired
    private CamelContext camelContext;

    @Autowired
    private DestinationRepository destinationRepository; // ✅ Inject Repository

    private static final String TOPIC_NAME = "fenta-check"; // ✅ Updated topic name
    private static final String RESPONSE_TOPIC = "fenta-response"; // ✅ Correct response topic
    private static final String CONSUMER_GROUP = "rits-group"; // ✅ Match existing group
    private static final String PRODUCER_ENDPOINT = "direct:sendToKafkaCheck"; // ✅ Single producer route

    // ✅ Track registered routes
    private final Map<String, Boolean> registeredRoutes = new ConcurrentHashMap<>();

    @PostConstruct
    public void initKafkaRoutes() {
        System.out.println("🔥 Initializing Kafka Routes...");

        List<Destination> destinations = destinationRepository.findAll();
        for (Destination destination : destinations) {
            String kafkaBroker = destination.getKafkaBrokers();
            if (kafkaBroker != null && !kafkaBroker.isEmpty()) {
                registerKafkaRoutes(kafkaBroker);
            }
        }
    }

    /**
     * ✅ Remove all registered routes when the application stops
     */
    @PreDestroy
    public void cleanUpKafkaRoutes() {
        System.out.println("🧹 Cleaning up Kafka Routes before shutdown...");

        for (String kafkaBroker : registeredRoutes.keySet()) {
            try {
                String producerRouteId = "route-kafka-producer-" + kafkaBroker;
                String consumerRouteId = "route-kafka-consumer-" + kafkaBroker;

                if (camelContext.getRoute(producerRouteId) != null) {
                    camelContext.getRouteController().stopRoute(producerRouteId);
                    camelContext.removeRoute(producerRouteId);
                    System.out.println("✅ Removed Kafka Producer Route: " + producerRouteId);
                }

                if (camelContext.getRoute(consumerRouteId) != null) {
                    camelContext.getRouteController().stopRoute(consumerRouteId);
                    camelContext.removeRoute(consumerRouteId);
                    System.out.println("✅ Removed Kafka Consumer Route: " + consumerRouteId);
                }
            } catch (Exception e) {
                System.err.println("❌ Error removing route for broker [" + kafkaBroker + "]: " + e.getMessage());
            }
        }

        registeredRoutes.clear(); // ✅ Ensure all tracked routes are cleared
    }

    /**
     * ✅ Registers Kafka producer & consumer routes dynamically.
     */
    private void registerKafkaRoutes(String kafkaBroker) {
        try {
            String producerRouteId = "route-kafka-producer-" + kafkaBroker;
            String consumerRouteId = "route-kafka-consumer-" + kafkaBroker;

            // ✅ Remove existing routes if present before registering new ones
            if (camelContext.getRoute(producerRouteId) != null) {
                camelContext.getRouteController().stopRoute(producerRouteId);
                camelContext.removeRoute(producerRouteId);
                System.out.println("⚠️ Removed old Kafka Producer Route before re-registering: " + producerRouteId);
            }

            if (camelContext.getRoute(consumerRouteId) != null) {
                camelContext.getRouteController().stopRoute(consumerRouteId);
                camelContext.removeRoute(consumerRouteId);
                System.out.println("⚠️ Removed old Kafka Consumer Route before re-registering: " + consumerRouteId);
            }

            camelContext.addRoutes(new RouteBuilder() {
                @Override
                public void configure() {
                    System.out.println("🔥 Registering Kafka Routes for broker: " + kafkaBroker);

                    // ✅ Producer Route (Sending messages to fenta-check)
                    from(PRODUCER_ENDPOINT)
                            .routeId(producerRouteId)
                            .log("🔥 Sending message to Kafka topic: " + TOPIC_NAME)
                            .to("kafka:" + TOPIC_NAME + "?brokers=" + kafkaBroker);

                    // ✅ Consumer Route (Listening to fenta-response)
                    from("kafka:" + RESPONSE_TOPIC + "?brokers=" + kafkaBroker
                            + "&groupId=" + CONSUMER_GROUP
                            + "&autoOffsetReset=earliest"
                            + "&maxPollRecords=10" // ✅ Optimize polling behavior
                            + "&allowManualCommit=true" // ✅ Ensures proper message handling
                            + "&consumersCount=1") // ✅ Prevents multiple consumers interfering
                            .routeId(consumerRouteId)
                            .log("✅ Received response from topic [" + RESPONSE_TOPIC + "] on broker [" + kafkaBroker
                                    + "]: ${body}")
                            .process(exchange -> {
                                String message = exchange.getIn().getBody(String.class);
                                System.out.println("📥 Received Message from Kafka: " + message);
                            });

                    System.out.println("✅ Kafka Routes Registered for broker: " + kafkaBroker);
                }
            });

            // ✅ Mark routes as registered
            registeredRoutes.put(kafkaBroker, true);

        } catch (Exception e) {
            System.err.println("❌ Error registering Kafka routes: " + e.getMessage());
        }
    }
}

// package com.rits.fentapco.configuration;

// import com.rits.fentapco.model.Destination;
// import com.rits.fentapco.repository.DestinationRepository;
// import org.apache.camel.CamelContext;
// import org.apache.camel.builder.RouteBuilder;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.stereotype.Component;

// import jakarta.annotation.PostConstruct;
// import java.util.List;

// @Component
// public class KafkaRouteInitializer {

// @Autowired
// private CamelContext camelContext;

// @Autowired
// private DestinationRepository destinationRepository; // ✅ Inject Repository

// private static final String TOPIC_NAME = "fenta-check"; // ✅ Updated topic
// name
// private static final String RESPONSE_TOPIC = "fenta-response"; // ✅ Correct
// response topic
// private static final String CONSUMER_GROUP = "rits-group"; // ✅ Match
// existing group
// private static final String PRODUCER_ROUTE_ID = "route-producer-" +
// TOPIC_NAME;
// private static final String CONSUMER_ROUTE_ID = "route-consumer-" +
// RESPONSE_TOPIC;
// private static final String PRODUCER_ENDPOINT = "direct:sendToKafkaCheck"; //
// ✅ Single producer route

// @PostConstruct
// public void initKafkaRoutes() {
// System.out.println("🔥 Initializing Kafka Routes...");

// List<Destination> destinations = destinationRepository.findAll();
// for (Destination destination : destinations) {
// String kafkaBroker = destination.getKafkaBrokers();
// if (kafkaBroker != null && !kafkaBroker.isEmpty()) {
// registerKafkaRoutes(kafkaBroker);
// }
// }
// }

// private void registerKafkaRoutes(String kafkaBroker) {
// try {
// // ✅ Avoid duplicate producer route
// if (camelContext.getRoute(PRODUCER_ROUTE_ID) == null) {
// camelContext.addRoutes(new RouteBuilder() {
// @Override
// public void configure() {
// System.out.println("🔥 Registering Kafka Producer Route for broker: " +
// kafkaBroker);

// from(PRODUCER_ENDPOINT)
// .routeId(PRODUCER_ROUTE_ID)
// .log("🔥 Sending message to Kafka topic: " + TOPIC_NAME)
// .to("kafka:" + TOPIC_NAME + "?brokers=" + kafkaBroker);
// }
// });

// System.out.println("✅ Kafka Producer Route Registered for broker: " +
// kafkaBroker);
// } else {
// System.out.println("⚠️ Producer Route already exists. Skipping...");
// }

// // ✅ Avoid duplicate consumer route
// if (camelContext.getRoute(CONSUMER_ROUTE_ID) == null) {
// camelContext.addRoutes(new RouteBuilder() {
// @Override
// public void configure() {
// System.out.println("🔥 Registering Kafka Consumer Route for broker: " +
// kafkaBroker);

// from("kafka:" + RESPONSE_TOPIC + "?brokers=" + kafkaBroker
// + "&groupId=" + CONSUMER_GROUP
// + "&autoOffsetReset=earliest")
// .routeId(CONSUMER_ROUTE_ID)
// .log("✅ Received response from topic [" + RESPONSE_TOPIC + "] on broker [" +
// kafkaBroker
// + "]: ${body}");
// }
// });

// System.out.println("✅ Kafka Consumer Route Registered for broker: " +
// kafkaBroker);
// } else {
// System.out.println("⚠️ Consumer Route already exists. Skipping...");
// }
// } catch (Exception e) {
// System.err.println("❌ Error registering Kafka route: " + e.getMessage());
// }
// }
// }
