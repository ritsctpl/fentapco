package com.rits.fentapco.service.impl;

import com.rits.fentapco.model.OpcUaConnection;
import com.rits.fentapco.model.OpcUaNode;
import com.rits.fentapco.model.OpcUaTag;
import com.rits.fentapco.repository.OpcUaConnectionRepository;
import com.rits.fentapco.service.OpcUaConnectionService;
import org.apache.camel.CamelContext;
import org.apache.camel.ProducerTemplate;
import org.apache.camel.builder.RouteBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.eclipse.milo.opcua.sdk.client.OpcUaClient;
import org.eclipse.milo.opcua.stack.core.Identifiers;
import org.eclipse.milo.opcua.stack.core.types.builtin.DataValue;
import org.eclipse.milo.opcua.stack.core.types.builtin.Variant;
import org.eclipse.milo.opcua.stack.core.types.enumerated.BrowseDirection;
import org.eclipse.milo.opcua.stack.core.types.enumerated.BrowseResultMask;
import org.eclipse.milo.opcua.stack.core.types.enumerated.NodeClass;
import org.eclipse.milo.opcua.stack.core.types.structured.BrowseDescription;
import org.eclipse.milo.opcua.stack.core.types.structured.BrowseResult;
import org.eclipse.milo.opcua.stack.core.types.structured.ReferenceDescription;
import static org.eclipse.milo.opcua.stack.core.types.builtin.unsigned.Unsigned.uint;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.eclipse.milo.opcua.stack.core.types.builtin.NodeId;

@Service
public class OpcUaConnectionServiceImpl implements OpcUaConnectionService {

    @Autowired
    private OpcUaConnectionRepository repository;

    @Autowired
    private CamelContext camelContext;

    @Override
    public List<OpcUaConnection> getAllConnections() {
        return repository.findAll();
    }

    @Override
    public Optional<OpcUaConnection> getConnectionById(Long id) {
        return repository.findById(id);
    }

    @Override
    public OpcUaConnection saveConnection(OpcUaConnection connection) {
        return repository.save(connection);
    }

    @Override
    public void deleteConnection(Long id) {
        repository.deleteById(id);
    }

    @Override
    public boolean testConnection(OpcUaConnection connection) {
        try (ProducerTemplate producerTemplate = camelContext.createProducerTemplate()) {
            String opcuaUri = "milo-client:" + connection.getEndpointUrl() + "?clientId=camel-client&method=browse";
            producerTemplate.sendBody(opcuaUri, null);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /*
     * @Override
     * public List<OpcUaNode> discoverNodes(OpcUaConnection connection) {
     * List<OpcUaNode> nodes = new ArrayList<>();
     * try (ProducerTemplate producerTemplate =
     * camelContext.createProducerTemplate()) {
     * String opcuaUri = "milo-client:" + connection.getEndpointUrl() +
     * "?clientId=camel-client&method=browse";
     * List<String> result = producerTemplate.requestBody(opcuaUri, null,
     * List.class);
     * result.forEach(node -> {
     * OpcUaNode opcUaNode = new OpcUaNode();
     * opcUaNode.setNodeId(node); // Simplified node ID storage
     * opcUaNode.setDisplayName(node);
     * nodes.add(opcUaNode);
     * });
     * } catch (Exception e) {
     * e.printStackTrace();
     * throw new RuntimeException("Failed to discover nodes: " + e.getMessage());
     * }
     * return nodes;
     * }
     */

    @Override
    public List<OpcUaNode> discoverNodes(OpcUaConnection connection) {
        List<OpcUaNode> nodes = new ArrayList<>();
        try {
            // Create OPC UA client
            OpcUaClient client = OpcUaClient.create(connection.getEndpointUrl());

            // Connect to the server
            client.connect().get();

            // Browse the root node for hierarchical references
            BrowseResult browseResult = client.browse(new BrowseDescription(
                    Identifiers.RootFolder,
                    BrowseDirection.Forward,
                    Identifiers.HierarchicalReferences,
                    true,
                    uint(NodeClass.Object.getValue() | NodeClass.Variable.getValue()),
                    uint(BrowseResultMask.All.getValue()))).get();

            // Process each reference
            for (ReferenceDescription ref : browseResult.getReferences()) {
                OpcUaNode opcUaNode = new OpcUaNode();
                opcUaNode.setNodeId(ref.getNodeId().toParseableString());
                opcUaNode.setDisplayName(ref.getDisplayName().getText());
                nodes.add(opcUaNode);
            }

            // Disconnect from the server
            client.disconnect().get();
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to discover nodes: " + e.getMessage());
        }
        return nodes;
    }

    @Override
    public void connectToOPCUA(OpcUaConnection connection, String nodeId) throws Exception {
        String opcuaUri = "milo-client:" + connection.getEndpointUrl()
                + "?clientId=camel-client&node=" + nodeId;

        camelContext.addRoutes(new RouteBuilder() {
            @Override
            public void configure() throws Exception {
                from(opcuaUri)
                        .process(exchange -> {
                            DataValue dataValue = exchange.getIn().getBody(DataValue.class);
                            if (dataValue != null && dataValue.getStatusCode().isGood()) {
                                Variant value = dataValue.getValue();
                                System.out.println("Node ID: " + nodeId + ", Value: " + value);
                            }
                        })
                        .log("Connected to node " + nodeId);
            }
        });

        camelContext.start();
    }

    @Override
    public void createTrigger(OpcUaConnection connection, String nodeId) throws Exception {
        String opcuaUri = "milo-client:" + connection.getEndpointUrl()
                + "?clientId=camel-client&node=" + nodeId;

        camelContext.addRoutes(new RouteBuilder() {
            @Override
            public void configure() throws Exception {
                from(opcuaUri)
                        .log("Value changed for node " + nodeId + ": ${body}");
            }
        });

        camelContext.start();
        System.out.println("Trigger created for node: " + nodeId);
    }

    @Override
    public String readTagValue(OpcUaConnection connection, String nodeId) throws Exception {
        String opcuaUri = "milo-client:" + connection.getEndpointUrl()
                + "?clientId=camel-client&node=" + nodeId;

        String tagValue = null;

        camelContext.addRoutes(new RouteBuilder() {
            @Override
            public void configure() throws Exception {
                from(opcuaUri)
                        .process(exchange -> {
                            DataValue dataValue = exchange.getIn().getBody(DataValue.class);
                            if (dataValue != null) {
                                Variant value = dataValue.getValue();
                                System.out.println("Read value: " + value);
                            }
                        });
            }
        });

        camelContext.start();
        Thread.sleep(1000); // Wait for route to process
        camelContext.stop();
        return tagValue;
    }

    @Override
    public List<String> getTagList(OpcUaConnection connection) throws Exception {
        String opcuaUri = "milo-client:" + connection.getEndpointUrl()
                + "?clientId=camel-client&method=browse";

        List<String> tagList = new ArrayList<>();

        camelContext.addRoutes(new RouteBuilder() {
            @Override
            public void configure() throws Exception {
                from(opcuaUri)
                        .process(exchange -> {
                            List<String> nodes = exchange.getIn().getBody(List.class);
                            tagList.addAll(nodes);
                        });
            }
        });

        camelContext.start();
        return tagList;
    }

    /*
     * @Override
     * public List<OpcUaTag> discoverTags(OpcUaConnection connection) {
     * List<OpcUaTag> tags = new ArrayList<>();
     * try (ProducerTemplate producerTemplate =
     * camelContext.createProducerTemplate()) {
     * String opcuaUri = "milo-client:" + connection.getEndpointUrl() +
     * "?clientId=camel-client&method=browse";
     * List<String> result = producerTemplate.requestBody(opcuaUri, null,
     * List.class);
     * result.forEach(tagId -> {
     * OpcUaTag tag = new OpcUaTag();
     * tag.setTagName(tagId); // Simplified for demonstration
     * tag.setNodeId(tagId);
     * tag.setOpcUaConnection(connection);
     * tags.add(tag);
     * });
     * } catch (Exception e) {
     * e.printStackTrace();
     * throw new RuntimeException("Failed to discover tags: " + e.getMessage());
     * }
     * return tags;
     * }
     */

    @Override
    public List<OpcUaTag> discoverTags(OpcUaConnection connection) {
        List<OpcUaTag> tags = new ArrayList<>();
        try {
            // Create OPC UA client
            OpcUaClient client = OpcUaClient.create(connection.getEndpointUrl());

            // Connect to the server
            client.connect().get();

            // Start recursive discovery from the RootFolder node
            browseTagsRecursively(client, Identifiers.RootFolder, tags, connection);

            // Disconnect from the server
            client.disconnect().get();
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to discover tags: " + e.getMessage());
        }
        return tags;
    }

    private void browseTagsRecursively(OpcUaClient client, NodeId parentNodeId, List<OpcUaTag> tags,
            OpcUaConnection connection) throws Exception {
        // Browse the current node
        BrowseResult browseResult = client.browse(new BrowseDescription(
                parentNodeId,
                BrowseDirection.Forward,
                Identifiers.HierarchicalReferences,
                true,
                uint(NodeClass.Object.getValue() | NodeClass.Variable.getValue()),
                uint(BrowseResultMask.All.getValue()))).get();

        // Process each reference
        for (ReferenceDescription ref : browseResult.getReferences()) {
            NodeId nodeId = ref.getNodeId().toNodeId(client.getNamespaceTable()).orElse(null);
            if (nodeId != null) {
                // Create a new OpcUaTag for the current node
                OpcUaTag tag = new OpcUaTag();
                tag.setNodeId(nodeId.toParseableString());
                tag.setTagName(ref.getDisplayName().getText());
                tag.setOpcUaConnection(connection);
                tags.add(tag);

                // Recursively browse child nodes
                browseTagsRecursively(client, nodeId, tags, connection);
            }
        }
    }

    @Override
    public List<String> validateTags(OpcUaConnection connection, List<String> tagIds) {
        List<String> validTags = new ArrayList<>();
        List<OpcUaTag> discoveredTags = discoverTags(connection);

        for (String tagId : tagIds) {
            if (discoveredTags.stream().anyMatch(tag -> tag.getNodeId().equals(tagId))) {
                validTags.add(tagId);
            }
        }

        return validTags;
    }
}
