package com.rits.fentapco.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rits.fentapco.dto.DestinationDTO;
import com.rits.fentapco.model.Destination;
import com.rits.fentapco.repository.DestinationRepository;
import com.rits.fentapco.service.DestinationService;
import com.rits.fentapco.service.PcoIdService;

import org.apache.camel.CamelContext;
import org.apache.camel.ProducerTemplate;
import org.apache.camel.builder.RouteBuilder;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

import java.util.Map;

@Service
public class DestinationServiceImpl implements DestinationService {

    private final ProducerTemplate producerTemplate;
    private final CamelContext camelContext;
    @Autowired
    private DestinationRepository destinationRepository;

    @Autowired
    private PcoIdService pcoIdService;

    private static final String TOPIC_NAME = "fenta-check";
    private static final String RESPONSE_TOPIC = "fenta-response";
    private static final String CONSUMER_GROUP = "rits-group";
    private static final String PRODUCER_ENDPOINT = "direct:sendToKafkaCheck";

    public DestinationServiceImpl(ProducerTemplate producerTemplate, CamelContext camelContext) {
        this.producerTemplate = producerTemplate;
        this.camelContext = camelContext;
    }

    @Override
    public DestinationDTO createDestination(DestinationDTO dto) {
        Destination destination = mapToEntity(dto);
        return mapToDTO(destinationRepository.save(destination));
    }

    @Override
    public DestinationDTO updateDestination(Long id, DestinationDTO dto) {
        Destination destination = destinationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Destination not found"));

        destination.setName(dto.getName());
        destination.setProtocol(dto.getProtocol());
        destination.setApiUrl(dto.getApiUrl());
        destination.setMethodType(dto.getMethodType());
        destination.setHeaders(dto.getHeaders());
        destination.setBodyTemplate(dto.getBodyTemplate());
        destination.setAuthenticationType(dto.getAuthenticationType());
        destination.setUsername(dto.getUsername());
        destination.setPassword(dto.getPassword());
        destination.setBearerToken(dto.getBearerToken());
        destination.setActive(dto.isActive());

        return mapToDTO(destinationRepository.save(destination));
    }

    @Override
    public void deleteDestination(Long id) {
        destinationRepository.deleteById(id);
    }

    @Override
    public List<DestinationDTO> getAllDestinations() {
        return destinationRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public DestinationDTO getDestinationById(Long id) {
        Destination destination = destinationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Destination not found"));
        return mapToDTO(destination);
    }

    private DestinationDTO mapToDTO(Destination destination) {
        DestinationDTO dto = new DestinationDTO();
        dto.setId(destination.getId());
        dto.setName(destination.getName());
        dto.setProtocol(destination.getProtocol());
        dto.setApiUrl(destination.getApiUrl());
        dto.setMethodType(destination.getMethodType());
        dto.setHeaders(destination.getHeaders());
        dto.setBodyTemplate(destination.getBodyTemplate());
        dto.setAuthenticationType(destination.getAuthenticationType());
        dto.setUsername(destination.getUsername());
        dto.setPassword(destination.getPassword());
        dto.setBearerToken(destination.getBearerToken());
        dto.setActive(destination.isActive());
        return dto;
    }

    private Destination mapToEntity(DestinationDTO dto) {
        Destination destination = new Destination();
        destination.setName(dto.getName());
        destination.setProtocol(dto.getProtocol());
        destination.setApiUrl(dto.getApiUrl());
        destination.setMethodType(dto.getMethodType());
        destination.setHeaders(dto.getHeaders());
        destination.setBodyTemplate(dto.getBodyTemplate());
        destination.setAuthenticationType(dto.getAuthenticationType());
        destination.setUsername(dto.getUsername());
        destination.setPassword(dto.getPassword());
        destination.setBearerToken(dto.getBearerToken());
        destination.setActive(dto.isActive());
        destination.setKafkaBrokers(dto.getKafkaBrokers());
        destination.setKafkaTopic(dto.getKafkaTopic());
        return destination;
    }

    // @Override
    // public DestinationDTO createOrUpdateDestination(DestinationDTO dto) {
    // Destination destination = destinationRepository.findByName(dto.getName());
    // if (destination == null) {
    // destination = new Destination();
    // }

    // destination.setName(dto.getName());
    // destination.setProtocol(dto.getProtocol());
    // destination.setKafkaBrokers(dto.getKafkaBrokers());

    // // ✅ If Protocol is "FENTA", Register Kafka Dynamically using Camel
    // if ("FENTA".equalsIgnoreCase(dto.getProtocol())) {

    // registerKafkaRoutes(dto.getKafkaBrokers(), dto.getName());
    // }

    // destination = destinationRepository.save(destination);
    // return new DestinationDTO(destination.getId(), destination.getName(),
    // destination.getProtocol(),
    // destination.getKafkaBrokers());
    // }

    // private void registerKafkaRoutes(String kafkaBroker, String topicNameInput) {
    // String topicName = topicNameInput != null ? topicNameInput : "fenta-check";
    // // ✅ Matching topic
    // String consumerGroup = "rits-group"; // ✅ Matching existing group

    // try {
    // camelContext.addRoutes(new RouteBuilder() {
    // @Override
    // public void configure() {
    // System.out.println("🔥 Registering Kafka Routes...");

    // // ✅ Producer - Send message to Kafka topic `fenta-check`
    // from("direct:sendToKafkaCheck")
    // .log("🔥 Preparing to send message to Kafka topic: " + topicName)
    // .process(exchange -> {
    // Map<String, Object> message = exchange.getIn().getBody(Map.class);
    // String correlationId = (String) message.get("correlationId");
    // String pcoId = (String) message.get("pcoId");

    // Map<String, Object> kafkaMessage = Map.of(
    // "correlationId", correlationId,
    // "pcoId", pcoId,
    // "status", "initiated");
    // exchange.getMessage().setBody(kafkaMessage);
    // })
    // .log("✅ Sending message to Kafka topic [" + topicName + "] on broker [" +
    // kafkaBroker
    // + "]: ${body}")
    // .to("kafka:" + topicName + "?brokers=" + kafkaBroker);

    // // ✅ Consumer - Listen on `fenta-response` (this might be needed)
    // from("kafka:fenta-response?brokers=" + kafkaBroker
    // + "&groupId=" + consumerGroup // ✅ Using the same group
    // + "&autoOffsetReset=earliest")
    // .log("✅ Received response from topic [fenta-response] on broker [" +
    // kafkaBroker
    // + "]: ${body}")
    // .process(exchange -> {
    // Map<String, Object> receivedMessage = exchange.getIn().getBody(Map.class);
    // String correlationId = (String) receivedMessage.get("correlationId");
    // String pcoId = (String) receivedMessage.get("pcoId");

    // // ✅ Construct response message
    // Map<String, Object> processedResponse = Map.of(
    // "correlationId", correlationId,
    // "pcoId", pcoId,
    // "status", "processed");
    // exchange.getMessage().setBody(processedResponse);
    // })
    // .log("✅ Processed response: ${body}");
    // }
    // });

    // System.out.println("✅ Kafka routes registered for broker: " + kafkaBroker +
    // ", Topic: " + topicName);
    // } catch (Exception e) {
    // System.err.println("❌ Error registering Kafka route: " + e.getMessage());
    // e.printStackTrace();
    // }
    // }

    // ✅ Keep track of registered routes to prevent duplicates
    private final Map<String, Boolean> registeredRoutes = new ConcurrentHashMap<>();

    @Override
    public DestinationDTO createOrUpdateDestination(DestinationDTO dto) {
        System.out.println("🔥 Processing destination: " + dto.getName());

        // ✅ Check if destination exists
        Destination destination = destinationRepository.findByName(dto.getName());
        if (destination == null) {
            destination = new Destination();
        }

        // ✅ Update fields
        destination.setName(dto.getName());
        destination.setProtocol(dto.getProtocol());
        destination.setKafkaBrokers(dto.getKafkaBrokers());

        // ✅ Save to DB
        destination = destinationRepository.save(destination);
        System.out.println("✅ Destination saved: " + destination.getName());

        // ✅ Dynamically Register Kafka Routes (if not already registered)
        registerKafkaRoutes(destination.getKafkaBrokers());

        // ✅ Send Message to Kafka
        sendMessageToKafka(destination.getId().toString());

        // ✅ Convert back to DTO
        return new DestinationDTO(destination.getId(), destination.getName(), destination.getProtocol(),
                destination.getKafkaBrokers());
    }

    private void registerKafkaRoutes(String kafkaBroker) {
        try {
            // ✅ Avoid duplicate route registration using a map
            if (registeredRoutes.containsKey(kafkaBroker)) {
                System.out.println("⚠️ Kafka routes already exist for broker: " + kafkaBroker);
                return;
            }

            camelContext.addRoutes(new RouteBuilder() {
                @Override
                public void configure() {
                    System.out.println("🔥 Registering Kafka Routes for broker: " + kafkaBroker);

                    // ✅ Producer Route (Sending messages to fenta-check)
                    from(PRODUCER_ENDPOINT)
                            .routeId("route-kafka-producer-" + kafkaBroker)
                            .log("🔥 Sending message to Kafka topic: " + TOPIC_NAME)
                            .to("kafka:" + TOPIC_NAME + "?brokers=" + kafkaBroker);

                    // ✅ Consumer Route (Listening to fenta-check-response)
                    // ✅ Improved Consumer Route for fenta-response
                    from("kafka:" + RESPONSE_TOPIC + "?brokers=" + kafkaBroker
                            + "&groupId=" + CONSUMER_GROUP
                            + "&autoOffsetReset=earliest"
                            + "&maxPollRecords=10" // ✅ Optimize polling behavior
                            + "&allowManualCommit=true" // ✅ Ensures proper message handling
                            + "&consumersCount=1") // ✅ Prevents multiple consumers interfering
                            .routeId("route-kafka-consumer-" + kafkaBroker)
                            .log("✅ Received response from topic [" + RESPONSE_TOPIC + "] on broker [" + kafkaBroker
                                    + "]: ${body}")
                            .process(exchange -> {
                                String message = exchange.getIn().getBody(String.class);
                                System.out.println("📥 Received Message from Kafka: " + message);

                                ObjectMapper objectMapper = new ObjectMapper();
                                JsonNode jsonNode = objectMapper.readTree(message);

                                String pcoId = jsonNode.get("pcoId").asText();
                                String status = jsonNode.get("status").asText();

                                if ("registered".equalsIgnoreCase(status)) {
                                    Long destinationId = Long.parseLong(pcoId);
                                    Optional<Destination> destinationOpt = destinationRepository
                                            .findById(destinationId);
                                    if (destinationOpt.isPresent()) {
                                        Destination destination = destinationOpt.get();
                                        destination.setActive(true); // or true if using boolean
                                        destinationRepository.save(destination);
                                        System.out.println(
                                                "✅ Destination [" + destination.getName() + "] marked as ACTIVE.");
                                    } else {
                                        System.err.println("❌ Destination not found for pcoId: " + pcoId);
                                    }
                                }
                            });

                }
            });

            // ✅ Mark route as registered
            registeredRoutes.put(kafkaBroker, true);
            System.out.println("✅ Kafka routes registered for broker: " + kafkaBroker);

        } catch (Exception e) {
            System.err.println("❌ Error registering Kafka route: " + e.getMessage());
        }
    }

    private void sendMessageToKafka(String destinationId) {
        try {
            ObjectMapper objectMapper = new ObjectMapper(); // ✅ Jackson for JSON conversion

            Map<String, Object> message = Map.of(
                    "correlationId", UUID.randomUUID().toString(),
                    "pcoId", destinationId,
                    "status", "initiated");

            String jsonMessage = objectMapper.writeValueAsString(message); // ✅ Convert to JSON string

            System.out.println("🔥 Sending Kafka message: " + jsonMessage);
            producerTemplate.sendBody(PRODUCER_ENDPOINT, jsonMessage); // ✅ Send as a String

        } catch (Exception e) {
            System.err.println("❌ Error sending Kafka message: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Override
    public void sendMessage(String topic, String message, String kafkaBroker) {
        try {
            String kafkaUri = "kafka:" + topic + "?brokers=" + kafkaBroker;
            producerTemplate.sendBody(kafkaUri, message);
            System.out.println("✅ Sent message to Kafka broker: " + kafkaBroker + ", Topic: " + topic);
        } catch (Exception e) {
            System.err.println("❌ Error sending message to Kafka: " + e.getMessage());
        }
    }

    // on delete of the destination we should use it.
    public void unregisterKafkaRoutes(String kafkaBroker) {
        try {
            String producerRouteId = "route-kafka-producer-" + kafkaBroker;
            String consumerRouteId = "route-kafka-consumer-" + kafkaBroker;

            if (camelContext.getRoute(producerRouteId) != null) {
                camelContext.getRouteController().stopRoute(producerRouteId);
                camelContext.removeRoute(producerRouteId);
                System.out.println("🛑 Removed producer route: " + producerRouteId);
            }

            if (camelContext.getRoute(consumerRouteId) != null) {
                camelContext.getRouteController().stopRoute(consumerRouteId);
                camelContext.removeRoute(consumerRouteId);
                System.out.println("🛑 Removed consumer route: " + consumerRouteId);
            }

        } catch (Exception e) {
            System.err.println("❌ Error unregistering Kafka route: " + e.getMessage());
        }
    }

}
