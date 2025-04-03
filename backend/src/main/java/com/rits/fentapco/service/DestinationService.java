package com.rits.fentapco.service;

import com.rits.fentapco.dto.DestinationDTO;
import com.rits.fentapco.model.Destination;
import java.util.List;

public interface DestinationService {
    DestinationDTO createDestination(DestinationDTO dto);

    DestinationDTO updateDestination(Long id, DestinationDTO dto);

    void deleteDestination(Long id);

    List<DestinationDTO> getAllDestinations();

    DestinationDTO getDestinationById(Long id);

    DestinationDTO createOrUpdateDestination(DestinationDTO dto); // ✅ Unified Method

    void sendMessage(String topic, String message, String kafkaBroker);

}
