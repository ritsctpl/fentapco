package com.rits.fentapco.repository;

import com.rits.fentapco.model.OpcUaConnection;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OpcUaConnectionRepository extends JpaRepository<OpcUaConnection, Long> {
}
