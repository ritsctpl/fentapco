package com.rits.fentapco.service;

import com.rits.fentapco.model.OpcUaConnection;
import com.rits.fentapco.model.OpcUaNode;
import com.rits.fentapco.model.OpcUaTag;

import java.util.List;
import java.util.Optional;

public interface OpcUaConnectionService {

    List<OpcUaConnection> getAllConnections();

    Optional<OpcUaConnection> getConnectionById(Long id);

    OpcUaConnection saveConnection(OpcUaConnection connection);

    void deleteConnection(Long id);

    boolean testConnection(OpcUaConnection connection);

    List<OpcUaNode> discoverNodes(OpcUaConnection connection);

    void connectToOPCUA(OpcUaConnection connection, String nodeId) throws Exception;

    void createTrigger(OpcUaConnection connection, String nodeId) throws Exception;

    String readTagValue(OpcUaConnection connection, String nodeId) throws Exception;

    List<String> getTagList(OpcUaConnection connection) throws Exception;

    List<OpcUaTag> discoverTags(OpcUaConnection connection);

    List<String> validateTags(OpcUaConnection connection, List<String> tagIds);
}
