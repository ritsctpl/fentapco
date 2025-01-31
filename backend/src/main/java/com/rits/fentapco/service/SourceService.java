package com.rits.fentapco.service;

import com.rits.fentapco.model.OpcUaConnection;
import com.rits.fentapco.model.Source;
import com.rits.fentapco.model.SourceNode;

import java.util.List;
import java.util.Optional;

public interface SourceService {
    List<Source> getAllSources();

    Optional<Source> getSourceById(Long id);

    Source saveSource(Source source);

    void deleteSource(Long id);

    boolean testConnection(Source source);

    List<SourceNode> discoverNodes(Source source);

    Optional<OpcUaConnection> getOpcUaConnection(Long sourceId);

    List<SourceNode> discoverChildNodes(Source source, String parentNodeId);

    SourceNode discoverCompleteNodeHierarchy(Source source);

}
