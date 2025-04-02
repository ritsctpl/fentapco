package com.rits.fentapco.service.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.apache.camel.CamelContext;
import org.eclipse.milo.opcua.sdk.client.OpcUaClient;
import org.eclipse.milo.opcua.stack.core.Identifiers;
import org.eclipse.milo.opcua.stack.core.types.builtin.NodeId;
import static org.eclipse.milo.opcua.stack.core.types.builtin.unsigned.Unsigned.uint;
import org.eclipse.milo.opcua.stack.core.types.enumerated.BrowseDirection;
import org.eclipse.milo.opcua.stack.core.types.enumerated.BrowseResultMask;
import org.eclipse.milo.opcua.stack.core.types.enumerated.NodeClass;
import org.eclipse.milo.opcua.stack.core.types.structured.BrowseDescription;
import org.eclipse.milo.opcua.stack.core.types.structured.BrowseResult;
import org.eclipse.milo.opcua.stack.core.types.structured.ReferenceDescription;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.rits.fentapco.model.OpcUaConnection;
import com.rits.fentapco.model.Source;
import com.rits.fentapco.model.SourceNode;
import com.rits.fentapco.repository.OpcUaConnectionRepository;
import com.rits.fentapco.repository.SourceRepository;
import com.rits.fentapco.service.SourceService;

@Service
public class SourceServiceImpl implements SourceService {

    @Autowired
    private SourceRepository sourceRepository;

    @Autowired
    private OpcUaConnectionRepository opcUaConnectionRepository;

    @Autowired
    private CamelContext camelContext;

    @Override
    public List<Source> getAllSources() {
        return sourceRepository.findAll();
    }

    @Override
    public Optional<Source> getSourceById(Long id) {
        return sourceRepository.findById(id);
    }

    @Override
    public Source saveSource(Source source) {
        if ("opcua".equalsIgnoreCase(source.getType())) {
            // Ensure `OpcUaConnection` is created or retrieved
            OpcUaConnection opcUaConnection = createOrGetOpcUaConnection(source);
            source.setOpcUaConnection(opcUaConnection);
        }
        return sourceRepository.save(source);
    }

    private OpcUaConnection createOrGetOpcUaConnection(Source source) {
        // Check if an OPC UA connection with the same `endpointUrl` already exists
        Optional<OpcUaConnection> existingConnection = source.getOpcUaConnection() != null
                ? Optional.of(source.getOpcUaConnection())
                : Optional.empty();

        if (existingConnection.isPresent()) {
            return existingConnection.get();
        }

        // Create a new `OpcUaConnection` if it doesn't exist
        OpcUaConnection opcUaConnection = new OpcUaConnection();
        opcUaConnection.setName(source.getName() + " Connection");
        opcUaConnection.setEndpointUrl(source.getEndpointUrl());
        opcUaConnection.setUsername(source.getUsername());
        opcUaConnection.setPassword(source.getPassword());
        opcUaConnection.setActive(true);

        return opcUaConnectionRepository.save(opcUaConnection);
    }

    @Override
    public void deleteSource(Long id) {
        Optional<Source> source = sourceRepository.findById(id);
        sourceRepository.deleteById(id);
        opcUaConnectionRepository.deleteById(source.get().getOpcUaConnection().getId());
    }

    @Override
    public boolean testConnection(Source source) {
        OpcUaConnection opcUaConnection = createOrGetOpcUaConnection(source);
        try {
            OpcUaClient client = OpcUaClient.create(opcUaConnection.getEndpointUrl());
            client.connect().get();
            client.disconnect().get();
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public List<SourceNode> discoverNodes(Source source) {
        OpcUaConnection opcUaConnection = createOrGetOpcUaConnection(source);
        List<SourceNode> nodes = new ArrayList<>();
        try {
            OpcUaClient client = OpcUaClient.create(opcUaConnection.getEndpointUrl());
            client.connect().get();

            BrowseResult browseResult = client.browse(new BrowseDescription(
                    Identifiers.RootFolder,
                    BrowseDirection.Forward,
                    Identifiers.HierarchicalReferences,
                    true,
                    uint(NodeClass.Object.getValue() | NodeClass.Variable.getValue()),
                    uint(BrowseResultMask.All.getValue()))).get();

            for (ReferenceDescription ref : browseResult.getReferences()) {
                SourceNode node = new SourceNode();
                node.setNodeId(ref.getNodeId().toParseableString());
                node.setDisplayName(ref.getDisplayName().getText());
                nodes.add(node);
            }

            client.disconnect().get();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return nodes;
    }

    @Override
    public List<SourceNode> discoverChildNodes(Source source, String parentNodeId) {
        List<SourceNode> nodes = new ArrayList<>();
        try {
            // Build the endpoint URL for the OPC UA source
            String endpointUrl = source.getEndpointUrl();

            // Create an OPC UA client
            OpcUaClient client = OpcUaClient.create(endpointUrl);

            // Connect to the server
            client.connect().get();

            // Browse the given parent node
            NodeId parentNode = NodeId.parse(parentNodeId);
            BrowseResult browseResult = client.browse(
                    new BrowseDescription(
                            parentNode,
                            BrowseDirection.Forward,
                            Identifiers.HierarchicalReferences,
                            true,
                            uint(NodeClass.Object.getValue() | NodeClass.Variable.getValue()),
                            uint(BrowseResultMask.All.getValue())))
                    .get();

            // Process the browse results
            for (ReferenceDescription reference : browseResult.getReferences()) {
                SourceNode sourceNode = new SourceNode();
                sourceNode.setNodeId(reference.getNodeId().toParseableString());
                sourceNode.setDisplayName(reference.getDisplayName().getText());
                nodes.add(sourceNode);
            }

            // Disconnect the client
            client.disconnect().get();

            System.out.println("Child node discovery successful for parent node: " + parentNodeId);
        } catch (Exception e) {
            System.err.println("Failed to discover child nodes for parent node: " + parentNodeId);
            e.printStackTrace();
            throw new RuntimeException("Failed to discover child nodes: " + e.getMessage());
        }
        return nodes;
    }

    private String buildUriForSource(Source source) {
        String baseUri = source.getEndpointUrl();
        switch (source.getType().toLowerCase()) {
            case "opcua":
                return "milo-client:" + baseUri + "?clientId=camel-client";
            case "mqtt":
                return "paho-mqtt5:" + baseUri;
            case "kafka":
                return "kafka:" + baseUri;
            case "tcp":
                return "netty:tcp://" + baseUri;
            case "udp":
                return "netty:udp://" + baseUri;
            case "ftp":
                return "ftp://" + baseUri;
            default:
                throw new IllegalArgumentException("Unsupported protocol: " + source.getType());
        }
    }

    @Override
    public Optional<OpcUaConnection> getOpcUaConnection(Long sourceId) {
        Source source = sourceRepository.findById(sourceId)
                .orElseThrow(() -> new RuntimeException("Source not found with ID: " + sourceId));

        // Retrieve the associated OpcUaConnection
        return Optional.ofNullable(source.getOpcUaConnection());
    }

    @Override
    public SourceNode discoverCompleteNodeHierarchy(Source source) {
        SourceNode rootNode = null;
        try {
            // Build the endpoint URL for the OPC UA source
            String endpointUrl = source.getEndpointUrl();

            // Create an OPC UA client
            OpcUaClient client = OpcUaClient.create(endpointUrl);

            // Connect to the server
            client.connect().get();

            // Start the recursive discovery from the root node
            NodeId rootNodeId = Identifiers.RootFolder;
            rootNode = new SourceNode();
            rootNode.setNodeId(rootNodeId.toParseableString());
            rootNode.setDisplayName("Root");

            browseNodeHierarchy(client, rootNodeId, rootNode);

            // Disconnect the client
            client.disconnect().get();

            System.out.println("Complete node hierarchy discovery successful.");
        } catch (Exception e) {
            System.err.println("Failed to discover complete node hierarchy for source: " + source.getEndpointUrl());
            e.printStackTrace();
            throw new RuntimeException("Failed to discover complete node hierarchy: " + e.getMessage());
        }
        return rootNode;
    }

    private void browseNodeHierarchy(OpcUaClient client, NodeId parentNodeId, SourceNode parentSourceNode)
            throws Exception {
        // Browse the current node
        BrowseResult browseResult = client.browse(
                new BrowseDescription(
                        parentNodeId,
                        BrowseDirection.Forward,
                        Identifiers.HierarchicalReferences,
                        true,
                        uint(NodeClass.Object.getValue() | NodeClass.Variable.getValue()),
                        uint(BrowseResultMask.All.getValue())))
                .get();

        // Process each reference
        for (ReferenceDescription reference : browseResult.getReferences()) {
            // Convert the nodeId to a fully qualified form
            NodeId nodeId = reference.getNodeId().toNodeId(client.getNamespaceTable()).orElse(null);

            if (nodeId != null) {
                // Create a new SourceNode
                SourceNode childNode = new SourceNode();
                childNode.setNodeId(nodeId.toParseableString());
                childNode.setDisplayName(reference.getDisplayName().getText());

                // Add child node to the parent node
                parentSourceNode.getChildren().add(childNode);

                // Recursively browse child nodes
                browseNodeHierarchy(client, nodeId, childNode);
            }
        }
    }

}
