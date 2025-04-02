package com.rits.fentapco.repository;

import com.rits.fentapco.model.Destination;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DestinationRepository extends JpaRepository<Destination, Long> {
    Destination findByName(String name); // ✅ Fetch Kafka broker dynamically

    List<Destination> findByProtocol(String protocol);

}
