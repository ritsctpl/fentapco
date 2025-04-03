package com.rits.fentapco.controller;

import com.rits.fentapco.configuration.KafkaRouteInitializer;
import com.rits.fentapco.dto.DestinationDTO;
import com.rits.fentapco.model.Destination;
import com.rits.fentapco.repository.DestinationRepository;
import com.rits.fentapco.service.DestinationService;

import org.apache.camel.ProducerTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/destinations")
public class DestinationController {

    @Autowired
    private DestinationService destinationService;

    private final DestinationRepository destinationRepository;

    public DestinationController(DestinationRepository destinationRepository) {
        this.destinationRepository = destinationRepository;
    }

    /*
     * @PostMapping
     * public DestinationDTO createDestination(@RequestBody DestinationDTO dto) {
     * // return destinationService.createDestination(dto);
     * return destinationService.createOrUpdateDestination(dto); // ✅ Calls a
     * unified method
     * }
     */
    @Autowired
    private KafkaRouteInitializer kafkaRouteInitializer; // ✅ Inject Kafka Route Initializer
    @Autowired
    private ProducerTemplate producerTemplate; // ✅ Inject Camel ProducerTemplate

    // @PostMapping
    // public DestinationDTO createOrUpdateDestination(@RequestBody DestinationDTO
    // dto) {
    // System.out.println("🔥 Saving destination: " + dto.getName());

    // // ✅ Convert DTO to Entity & Save in Database
    // Destination savedDestination = destinationRepository.save(dto.toEntity());

    // System.out.println("✅ Destination saved: " + savedDestination.getName());

    // // ✅ Register Kafka Route Dynamically for the broker
    // String kafkaBroker = savedDestination.getKafkaBrokers();
    // kafkaRouteInitializer.registerKafkaRoutes(kafkaBroker, "kafka-check");

    // // ✅ Create Kafka message and send it
    // Map<String, Object> message = new HashMap<>();
    // message.put("correlationId", UUID.randomUUID().toString()); // ✅ Generate
    // correlation ID
    // message.put("pcoId", savedDestination.getId().toString()); // ✅ Use saved ID
    // message.put("status", "initiated");

    // System.out.println("🔥 Sending Kafka message: " + message);
    // producerTemplate.sendBody("direct:sendToKafkaCheck", message);

    // return DestinationDTO.fromEntity(savedDestination); // ✅ Convert back to DTO
    // }

    @PostMapping
    public DestinationDTO createOrUpdateDestination(@RequestBody DestinationDTO dto) {
        System.out.println("🔥 Saving destination: " + dto.getName());
        return destinationService.createOrUpdateDestination(dto);
    }

    @PutMapping("/{id}")
    public DestinationDTO updateDestination(@PathVariable Long id, @RequestBody DestinationDTO dto) {
        // return destinationService.updateDestination(id, dto);
        return destinationService.createOrUpdateDestination(dto); // ✅ Calls the same method
    }

    @GetMapping("/{id}")
    public DestinationDTO getDestinationById(@PathVariable Long id) {
        return destinationService.getDestinationById(id);
    }

    @GetMapping
    public List<DestinationDTO> getAllDestinations() {
        return destinationService.getAllDestinations();
    }

    @DeleteMapping("/{id}")
    public void deleteDestination(@PathVariable Long id) {
        destinationService.deleteDestination(id);
    }

    @PostMapping("/update-kafka-broker")
    public String updateKafkaBroker(@RequestParam String kafkaBrokers) {
        Destination destination = destinationRepository.findByName("FentaKafka");
        if (destination == null) {
            destination = new Destination();
            destination.setName("FentaKafka");
        }
        destination.setKafkaBrokers(kafkaBrokers);
        destinationRepository.save(destination);

        return "✅ Kafka broker updated successfully: " + kafkaBrokers;
    }
}
