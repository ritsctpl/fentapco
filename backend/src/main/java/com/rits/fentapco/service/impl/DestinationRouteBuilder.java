package com.rits.fentapco.service.impl;

import com.rits.fentapco.model.Destination;
import com.rits.fentapco.repository.DestinationRepository;
import org.apache.camel.builder.RouteBuilder;
import org.springframework.stereotype.Component;

@Component
public class DestinationRouteBuilder extends RouteBuilder {

    private final DestinationRepository destinationRepository;

    public DestinationRouteBuilder(DestinationRepository destinationRepository) {
        this.destinationRepository = destinationRepository;
    }

    @Override
    public void configure() {
        // ✅ Fetch Kafka broker dynamically from DB
        Destination kafkaDestination = destinationRepository.findByName("FentaKafka");
        if (kafkaDestination == null || kafkaDestination.getKafkaBrokers() == null) {
            throw new RuntimeException("❌ No Kafka broker configured in the database!");
        }
        String kafkaBrokers = kafkaDestination.getKafkaBrokers(); // ✅ Use DB-configured broker

        from("kafka:fenta-check-response?brokers=" + kafkaBrokers + "&groupId=destination-group")
                .process(exchange -> {
                    String response = exchange.getIn().getBody(String.class);
                    System.out.println("✅ Handshake Response Received: " + response);
                });

        System.out.println("✅ DestinationRouteBuilder using broker: " + kafkaBrokers);
    }
}
