// package com.rits.fentapco.service.impl;

// import com.rits.fentapco.configuration.WebSocketConfig;
// import com.rits.fentapco.configuration.WebSocketServerConfig;
// import com.rits.fentapco.model.Agent;
// import com.rits.fentapco.model.OpcUaTag;
// import com.rits.fentapco.repository.AgentRepository;
// import com.rits.fentapco.service.impl.OPCUAWebSocketHandler;

// import java.io.UnsupportedEncodingException;
// import java.net.URLEncoder;
// import java.nio.charset.StandardCharsets;
// import java.util.ArrayList;
// import java.util.Arrays;
// import java.util.List;
// import java.util.Map;
// import java.util.concurrent.ConcurrentHashMap;
// import java.util.stream.Collectors;
// import org.eclipse.milo.opcua.stack.core.types.builtin.StatusCode;
// import org.apache.camel.AggregationStrategy;
// import org.apache.camel.CamelContext;
// import org.apache.camel.Exchange;
// import org.apache.camel.builder.RouteBuilder;
// import org.eclipse.milo.opcua.stack.core.types.builtin.DataValue;
// import org.eclipse.milo.opcua.stack.core.types.builtin.Variant;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.stereotype.Component;
// import org.springframework.beans.factory.annotation.Value;

// @Component
// public class AgentRouteBuilder {

//     @Value("${websocket.port:9090}")
//     private int websocketPort;

//     @Autowired
//     private CamelContext camelContext;

//     @Autowired
//     private AgentRepository agentRepository;

//     @Autowired
//     private OPCUAWebSocketHandler opcuaWebSocketHandler;

//     @Autowired
//     private WebSocketServerConfig webSocketConfig;

//     private final Map<String, OPCUAWebSocketHandler> webSocketHandlers = new ConcurrentHashMap<>();

//     public void createAndStartRoute(Agent agent) throws Exception {
//         if (!"opcua".equalsIgnoreCase(agent.getSource().getType())) {
//             System.out.println("Agent source type is not OPC UA. Skipping route creation.");
//             return;
//         }

//         List<String> opcUaUris = buildOpcUaUris(agent);

//         for (String opcUaUri : opcUaUris) {
//             String routeId = "agent-route-" + agent.getId() + "-" + opcUaUri.hashCode();

//             if (camelContext.getRoute(routeId) != null) {
//                 camelContext.getRouteController().stopRoute(routeId);
//                 camelContext.removeRoute(routeId);
//             }

//             camelContext.addRoutes(new RouteBuilder() {

//                 @Override
//                 public void configure() throws Exception {
//                     from(opcUaUri)
//                             .routeId(routeId)
//                             .process(exchange -> {
//                                 DataValue dataValue = exchange.getIn().getBody(DataValue.class);
//                                 String nodeId = opcUaUri.substring(opcUaUri.indexOf("&node=") + 6);
//                                 Variant value = dataValue.getValue();
//                                 StatusCode statusCode = dataValue.getStatusCode();

//                                 if (statusCode.isGood()) {
//                                     String message = String.format("Node: %s, Value: %s", nodeId,
//                                             value.getValue());
//                                     if (agent.isWebsocketEnabled()) {
//                                         opcuaWebSocketHandler.sendMessageToAll(message);
//                                     }
//                                     if (agent.isSseEnabled()) {
//                                         SSEBroadcaster.broadcastMessage(message);
//                                     }
//                                 } else {
//                                     String error = String.format("Node: %s, Error: %s", nodeId, statusCode);
//                                     System.err.println(error);
//                                 }
//                             })
//                             .log("Streaming data for route: " + routeId);
//                 }
//             });

//             camelContext.getRouteController().startRoute(routeId);
//             System.out.println("Route started for OPC UA URI: " + opcUaUri);
//         }
//     }

//     public void createAndStartAggregateRoute(Agent agent) throws Exception {
//         if (!"opcua".equalsIgnoreCase(agent.getSource().getType())) {
//             System.out.println("Agent source type is not OPC UA. Skipping route creation.");
//             return;
//         }

//         // Define the aggregate route URI
//         String aggregateRouteId = "aggregate-route-" + agent.getId();
//         String aggregateUri = "direct:" + aggregateRouteId;

//         // Remove existing aggregate route if it exists
//         if (camelContext.getRoute(aggregateRouteId) != null) {
//             camelContext.getRouteController().stopRoute(aggregateRouteId);
//             camelContext.removeRoute(aggregateRouteId);
//         }

//         // Create routes for individual OPC UA nodes
//         for (OpcUaTag tag : agent.getSubscribedTags()) {
//             String opcUaUri = String.format("milo-client:%s?clientId=camel-client&method=subscribe&node=%s",
//                     agent.getOpcUaConnection().getEndpointUrl(),
//                     URLEncoder.encode(tag.getNodeId(), StandardCharsets.UTF_8.name()));

//             String nodeRouteId = "node-route-" + agent.getId() + "-" + tag.getNodeId().hashCode();

//             // Remove existing node route if it exists
//             if (camelContext.getRoute(nodeRouteId) != null) {
//                 camelContext.getRouteController().stopRoute(nodeRouteId);
//                 camelContext.removeRoute(nodeRouteId);
//             }

//             camelContext.addRoutes(new RouteBuilder() {
//                 @Override
//                 public void configure() throws Exception {
//                     from(opcUaUri)
//                             .routeId(nodeRouteId)
//                             .setHeader("CamelMiloNode", constant(tag.getNodeId())) // Add the node ID to the header
//                             .to(aggregateUri); // Send data to the aggregate route
//                     System.out.println("Route created for OPC UA node: " + tag.getNodeId());
//                 }
//             });
//         }

//         // Create the aggregate route
//         camelContext.addRoutes(new RouteBuilder() {
//             @Override
//             public void configure() throws Exception {
//                 from(aggregateUri)
//                         .routeId(aggregateRouteId)
//                         .process(exchange -> {
//                             // Process aggregated messages
//                             DataValue dataValue = exchange.getIn().getBody(DataValue.class);
//                             Variant value = dataValue.getValue();
//                             String nodeId = exchange.getIn().getHeader("CamelMiloNode", String.class);

//                             if (dataValue.getStatusCode().isGood()) {
//                                 String message = String.format("Node: %s, Value: %s", nodeId, value.getValue());

//                                 // Send messages via WebSocket if enabled
//                                 if (agent.isWebsocketEnabled()) {
//                                     OPCUAWebSocketHandler handler = webSocketHandlers.get(agent.getName());
//                                     if (handler != null) {
//                                         handler.sendMessageToAll(message);
//                                         System.out.println("Processed data: " + message);
//                                     }
//                                 }

//                                 // Send messages via SSE if enabled
//                                 if (agent.isSseEnabled()) {
//                                     SSEBroadcaster.broadcastMessage(message);
//                                 }
//                             } else {
//                                 System.err.println("Error processing node: " + nodeId);
//                             }
//                         });
//             }
//         });

//         /*
//          * if (agent.isWebsocketEnabled()) {
//          * String agentName = agent.getName();
//          * int port = 9090; // Fetch the port dynamically from the agent
//          * OPCUAWebSocketHandler handler = new OPCUAWebSocketHandler();
//          * 
//          * webSocketConfig.startWebSocketServer(agentName, handler, port);
//          * }
//          */
//         if (agent.isWebsocketEnabled()) {
//             String agentName = agent.getName();
//             int port = 9090; // Dynamically fetch the port from the agent
//             OPCUAWebSocketHandler handler = new OPCUAWebSocketHandler();

//             // Check if a WebSocket server and handler are already registered for this agent
//             if (!webSocketHandlers.containsKey(agentName)) {
//                 webSocketConfig.startWebSocketServer(agentName, handler, port);
//                 webSocketHandlers.put(agentName, handler);
//                 System.out.println("WebSocket server started for agent: " + agentName + " on port: " + port);
//             } else {
//                 System.out.println("WebSocket handler already registered for agent: " + agentName);
//             }
//         }

//         // Start the aggregate route
//         camelContext.getRouteController().startRoute(aggregateRouteId);
//         System.out.println("Aggregate route started for agent: " + agent.getName());
//     }

//     public void stopRoute(Long agentId) throws Exception {
//         // Identify the aggregate route ID
//         String aggregateRouteId = "aggregate-route-" + agentId;

//         // Stop and remove the aggregate route
//         if (camelContext.getRoute(aggregateRouteId) != null) {
//             camelContext.getRouteController().stopRoute(aggregateRouteId);
//             camelContext.removeRoute(aggregateRouteId);
//             System.out.println("Aggregate route stopped for agent ID: " + agentId);
//         } else {
//             System.out.println("No aggregate route found for agent ID: " + agentId);
//         }

//         // Stop and remove all individual node routes
//         camelContext.getRoutes().stream()
//                 .filter(route -> route.getId().startsWith("node-route-" + agentId))
//                 .forEach(route -> {
//                     try {
//                         camelContext.getRouteController().stopRoute(route.getId());
//                         camelContext.removeRoute(route.getId());
//                         System.out.println("Node route stopped: " + route.getId());
//                     } catch (Exception e) {
//                         System.err.println("Failed to stop route: " + route.getId() + " due to " + e.getMessage());
//                     }
//                 });

//         // Remove the WebSocket handler and stop the WebSocket server if enabled
//         Agent agent = agentRepository.findById(agentId)
//                 .orElseThrow(() -> new RuntimeException("Agent not found with ID: " + agentId));

//         if (agent.isWebsocketEnabled()) {
//             String agentName = agent.getName();
//             int port = 9090; // Fetch the WebSocket port from the agent configuration
//             String path = "/" + agentName;

//             // Remove the WebSocket handler
//             OPCUAWebSocketHandler handler = webSocketHandlers.get(agentName);
//             // OPCUAWebSocketHandler handler = webSocketHandlers.remove(path);
//             if (handler != null) {
//                 webSocketConfig.removeWebSocketHandler(port, path);
//                 webSocketHandlers.remove(agentName); // Remove after ensuring cleanup
//                 System.out.println("WebSocket handler removed for agent: " + agentName + " on port: " + port);
//             } else {
//                 System.out.println("No WebSocket handler found for agent: " + agentName + " on port: " + port);
//             }

//             // Stop the WebSocket server if no other handlers are registered on this port
//             if (webSocketConfig.isPortEmpty(port)) {
//                 webSocketConfig.stopWebSocketServer(port);
//                 System.out.println("WebSocket server stopped on port: " + port);
//             }
//         }
//     }

//     private List<String> buildOpcUaUris(Agent agent) {
//         List<String> opcUaUris = new ArrayList<>();

//         if (agent.getSubscribedTags() != null && !agent.getSubscribedTags().isEmpty()) {
//             for (OpcUaTag tag : agent.getSubscribedTags()) {
//                 String encodedNodeId = URLEncoder.encode(tag.getNodeId(), StandardCharsets.UTF_8);
//                 String opcUaUri = "milo-client:" + agent.getOpcUaConnection().getEndpointUrl() +
//                         "?clientId=camel-client&method=subscribe&node=" + encodedNodeId +
//                         "&requestedPublishingInterval=1000";
//                 opcUaUris.add(opcUaUri);
//             }
//         }
//         return opcUaUris;
//     }

//     private String buildOpcUaUri(Agent agent) throws UnsupportedEncodingException {
//         StringBuilder opcUaUri = new StringBuilder("milo-client:" + agent.getOpcUaConnection().getEndpointUrl());
//         opcUaUri.append("?clientId=camel-client&method=subscribe");

//         if (agent.getSubscribedTags() != null && !agent.getSubscribedTags().isEmpty()) {
//             String encodedNodeIds = agent.getSubscribedTags().stream()
//                     .map(OpcUaTag::getNodeId)
//                     .map(nodeId -> {
//                         try {
//                             return URLEncoder.encode(nodeId, StandardCharsets.UTF_8.name());
//                         } catch (UnsupportedEncodingException e) {
//                             throw new RuntimeException("Error encoding Node ID: " + nodeId, e);
//                         }
//                     })
//                     .reduce((tag1, tag2) -> tag1 + "," + tag2)
//                     .orElse("");

//             opcUaUri.append("&nodeIds=").append(encodedNodeIds);
//         }

//         return opcUaUri.toString();
//     }

// }
// package com.rits.fentapco.service.impl;

// import com.rits.fentapco.configuration.WebSocketServerConfig;
// import com.rits.fentapco.model.Agent;
// import com.rits.fentapco.model.OpcUaTag;
// import com.rits.fentapco.repository.AgentRepository;

// import org.apache.camel.CamelContext;
// import org.apache.camel.builder.RouteBuilder;
// import org.apache.camel.Exchange;
// import org.eclipse.milo.opcua.stack.core.types.builtin.DataValue;
// import org.eclipse.milo.opcua.stack.core.types.builtin.StatusCode;
// import org.eclipse.milo.opcua.stack.core.types.builtin.Variant;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.beans.factory.annotation.Value;
// import org.springframework.stereotype.Component;

// import java.io.IOException;
// import java.net.URLEncoder;
// import java.nio.charset.StandardCharsets;
// import java.util.ArrayList;
// import java.util.List;
// import java.util.Map;
// import java.util.concurrent.ConcurrentHashMap;

// @Component
// public class AgentRouteBuilder {

//     @Value("${websocket.port:9090}")
//     private int websocketPort;

//     @Autowired
//     private CamelContext camelContext;

//     @Autowired
//     private AgentRepository agentRepository;

//     @Autowired
//     private WebSocketServerConfig webSocketConfig;

//     private final Map<String, OPCUAWebSocketHandler> webSocketHandlers = new ConcurrentHashMap<>();

//     public void createAndStartRoute(Agent agent) throws Exception {
//         if (!"opcua".equalsIgnoreCase(agent.getSource().getType())) {
//             System.out.println("Agent source type is not OPC UA. Skipping route creation.");
//             return;
//         }

//         List<String> opcUaUris = buildOpcUaUris(agent);

//         for (String opcUaUri : opcUaUris) {
//             String routeId = "agent-route-" + agent.getId() + "-" + opcUaUri.hashCode();

//             stopAndRemoveRoute(routeId);

//             camelContext.addRoutes(new RouteBuilder() {
//                 @Override
//                 public void configure() throws Exception {
//                     from(opcUaUri)
//                             .routeId(routeId)
//                             .process(exchange -> processOpcUaMessage(exchange, opcUaUri, agent))
//                             .log("Streaming data for route: " + routeId);
//                 }
//             });

//             camelContext.getRouteController().startRoute(routeId);
//             System.out.println("Route started for OPC UA URI: " + opcUaUri);
//         }
//     }

//     public void createAndStartAggregateRoute(Agent agent) throws Exception {
//         if (!"opcua".equalsIgnoreCase(agent.getSource().getType())) {
//             System.out.println("Agent source type is not OPC UA. Skipping route creation.");
//             return;
//         }

//         String aggregateRouteId = "aggregate-route-" + agent.getId();
//         String aggregateUri = "direct:" + aggregateRouteId;

//         stopAndRemoveRoute(aggregateRouteId);

//         for (OpcUaTag tag : agent.getSubscribedTags()) {
//             String opcUaUri = String.format("milo-client:%s?clientId=camel-client&method=subscribe&node=%s",
//                     agent.getOpcUaConnection().getEndpointUrl(),
//                     URLEncoder.encode(tag.getNodeId(), StandardCharsets.UTF_8.name()));

//             String nodeRouteId = "node-route-" + agent.getId() + "-" + tag.getNodeId().hashCode();

//             stopAndRemoveRoute(nodeRouteId);

//             camelContext.addRoutes(new RouteBuilder() {
//                 @Override
//                 public void configure() throws Exception {
//                     from(opcUaUri)
//                             .routeId(nodeRouteId)
//                             .setHeader("CamelMiloNode", constant(tag.getNodeId()))
//                             .to(aggregateUri);
//                     System.out.println("Route created for OPC UA node: " + tag.getNodeId());
//                 }
//             });
//         }

//         camelContext.addRoutes(new RouteBuilder() {
//             @Override
//             public void configure() throws Exception {
//                 from(aggregateUri)
//                         .routeId(aggregateRouteId)
//                         .process(exchange -> processAggregateMessage(exchange, agent));
//             }
//         });

//         setupWebSocketIfEnabled(agent);

//         camelContext.getRouteController().startRoute(aggregateRouteId);
//         System.out.println("Aggregate route started for agent: " + agent.getName());
//     }

//     public void stopRoute(Long agentId) throws Exception {
//         String aggregateRouteId = "aggregate-route-" + agentId;

//         stopAndRemoveRoute(aggregateRouteId);

//         camelContext.getRoutes().stream()
//                 .filter(route -> route.getId().startsWith("node-route-" + agentId))
//                 .forEach(route -> {
//                     try {
//                         camelContext.getRouteController().stopRoute(route.getId());
//                         camelContext.removeRoute(route.getId());
//                         System.out.println("Node route stopped: " + route.getId());
//                     } catch (Exception e) {
//                         System.err.println("Failed to stop route: " + route.getId() + " due to " + e.getMessage());
//                     }
//                 });

//         Agent agent = agentRepository.findById(agentId)
//                 .orElseThrow(() -> new RuntimeException("Agent not found with ID: " + agentId));

//         if (agent.isWebsocketEnabled()) {
//             String agentName = agent.getName();
//             String path = "/" + agentName;

//             OPCUAWebSocketHandler handler = webSocketHandlers.remove(agentName);
//             if (handler != null) {
//                 webSocketConfig.removeWebSocketHandler(websocketPort, path);
//                 System.out.println("WebSocket handler removed for agent: " + agentName);
//             }

//             if (webSocketConfig.isPortEmpty(websocketPort)) {
//                 webSocketConfig.stopWebSocketServer(websocketPort);
//                 System.out.println("WebSocket server stopped on port: " + websocketPort);
//             }
//         }
//     }

//     private List<String> buildOpcUaUris(Agent agent) {
//         List<String> opcUaUris = new ArrayList<>();
//         for (OpcUaTag tag : agent.getSubscribedTags()) {
//             String encodedNodeId = URLEncoder.encode(tag.getNodeId(), StandardCharsets.UTF_8);
//             opcUaUris.add("milo-client:" + agent.getOpcUaConnection().getEndpointUrl() +
//                     "?clientId=camel-client&method=subscribe&node=" + encodedNodeId +
//                     "&requestedPublishingInterval=1000");
//         }
//         return opcUaUris;
//     }

//     private void stopAndRemoveRoute(String routeId) throws Exception {
//         if (camelContext.getRoute(routeId) != null) {
//             camelContext.getRouteController().stopRoute(routeId);
//             camelContext.removeRoute(routeId);
//             System.out.println("Route stopped and removed: " + routeId);
//         }
//     }

//     private void processOpcUaMessage(Exchange exchange, String opcUaUri, Agent agent) {
//         DataValue dataValue = exchange.getIn().getBody(DataValue.class);
//         String nodeId = opcUaUri.substring(opcUaUri.indexOf("&node=") + 6);
//         Variant value = dataValue.getValue();
//         StatusCode statusCode = dataValue.getStatusCode();

//         if (statusCode.isGood()) {
//             String message = String.format("Node: %s, Value: %s", nodeId, value.getValue());
//             sendToWebSocketAndSse(agent, message);
//         } else {
//             System.err.println(String.format("Node: %s, Error: %s", nodeId, statusCode));
//         }
//     }

//     private void processAggregateMessage(Exchange exchange, Agent agent) {
//         DataValue dataValue = exchange.getIn().getBody(DataValue.class);
//         Variant value = dataValue.getValue();
//         String nodeId = exchange.getIn().getHeader("CamelMiloNode", String.class);

//         if (dataValue.getStatusCode().isGood()) {
//             String message = String.format("Node: %s, Value: %s", nodeId, value.getValue());
//             sendToWebSocketAndSse(agent, message);
//         } else {
//             System.err.println("Error processing node: " + nodeId);
//         }
//     }

//     private void sendToWebSocketAndSse(Agent agent, String message) {
//         if (agent.isWebsocketEnabled()) {
//             OPCUAWebSocketHandler handler = webSocketHandlers.get(agent.getName());
//             if (handler != null) {
//                 try {
//                     handler.sendMessageToAll(message);
//                     // System.out.println("WebSocket message sent: " + message);
//                 } catch (IOException e) {
//                     System.err.println("Failed to send WebSocket message: " + e.getMessage());
//                     e.printStackTrace();
//                 }
//             }
//         }
//         if (agent.isSseEnabled()) {
//             SSEBroadcaster.broadcastMessage(message);
//         }
//     }

//     private void setupWebSocketIfEnabled(Agent agent) {
//         if (agent.isWebsocketEnabled()) {
//             String agentName = agent.getName();
//             OPCUAWebSocketHandler handler = webSocketHandlers.computeIfAbsent(agentName,
//                     name -> new OPCUAWebSocketHandler());
//             webSocketConfig.startWebSocketServer(agentName, handler, websocketPort);
//             System.out.println("WebSocket server started for agent: " + agentName + " on port: " + websocketPort);
//         }
//     }
// }
package com.rits.fentapco.service.impl;

import com.rits.fentapco.configuration.WebSocketServerConfig;
import com.rits.fentapco.model.Agent;
import com.rits.fentapco.model.OpcUaTag;
import com.rits.fentapco.repository.AgentRepository;

import org.apache.camel.CamelContext;
import org.apache.camel.builder.RouteBuilder;
import org.apache.camel.Exchange;
import org.eclipse.milo.opcua.stack.core.types.builtin.DataValue;
import org.eclipse.milo.opcua.stack.core.types.builtin.StatusCode;
import org.eclipse.milo.opcua.stack.core.types.builtin.Variant;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class AgentRouteBuilder {

    @Autowired
    private CamelContext camelContext;

    @Autowired
    private AgentRepository agentRepository;

    @Autowired
    private WebSocketServerConfig webSocketConfig;

    private final Map<String, OPCUAWebSocketHandler> webSocketHandlers = new ConcurrentHashMap<>();

    public void createAndStartRoute(Agent agent) throws Exception {
        if (!"opcua".equalsIgnoreCase(agent.getSource().getType())) {
            System.out.println("Agent source type is not OPC UA. Skipping route creation.");
            return;
        }

        List<String> opcUaUris = buildOpcUaUris(agent);

        for (String opcUaUri : opcUaUris) {
            String routeId = "agent-route-" + agent.getId() + "-" + opcUaUri.hashCode();

            stopAndRemoveRoute(routeId);

            camelContext.addRoutes(new RouteBuilder() {
                @Override
                public void configure() throws Exception {
                    from(opcUaUri)
                            .routeId(routeId)
                            .process(exchange -> processOpcUaMessage(exchange, opcUaUri, agent))
                            .log("Streaming data for route: " + routeId);
                }
            });

            camelContext.getRouteController().startRoute(routeId);
            System.out.println("Route started for OPC UA URI: " + opcUaUri);
        }
    }

    // public void createAndStartAggregateRoute(Agent agent) throws Exception {
    // if (!"opcua".equalsIgnoreCase(agent.getSource().getType())) {
    // System.out.println("Agent source type is not OPC UA. Skipping route
    // creation.");
    // return;
    // }

    // // String aggregateRouteId = "aggregate-route-" + agent.getId();
    // // String aggregateUri = "direct:" + aggregateRouteId;

    // String agentName = agent.getName();
    // String aggregateRouteId = "aggregate-route-" + agentName;
    // String aggregateUri = "direct:" + aggregateRouteId;

    // stopAndRemoveRoute(aggregateRouteId);

    // for (OpcUaTag tag : agent.getSubscribedTags()) {
    // // String opcUaUri =
    // //
    // String.format("milo-client:%s?clientId=camel-client&method=subscribe&node=%s",
    // // agent.getOpcUaConnection().getEndpointUrl(),
    // // URLEncoder.encode(tag.getNodeId(), StandardCharsets.UTF_8.name()));

    // // String nodeRouteId = "node-route-" + agent.getId() + "-" +
    // // tag.getNodeId().hashCode();

    // String opcUaUri =
    // String.format("milo-client:%s?clientId=camel-client-%s&method=subscribe&node=%s",
    // agent.getOpcUaConnection().getEndpointUrl(),
    // agentName, // Use agent name in clientId
    // URLEncoder.encode(tag.getNodeId(), StandardCharsets.UTF_8.name()));

    // String nodeRouteId = "node-route-" + agentName + "-" +
    // tag.getNodeId().hashCode();

    // stopAndRemoveRoute(nodeRouteId);

    // camelContext.addRoutes(new RouteBuilder() {
    // @Override
    // public void configure() throws Exception {
    // from(opcUaUri)
    // .routeId(nodeRouteId)
    // .setHeader("CamelMiloNode", constant(tag.getNodeId()))
    // .to(aggregateUri);
    // System.out.println("Route created for OPC UA node: " + tag.getNodeId());
    // }
    // });
    // }

    // camelContext.addRoutes(new RouteBuilder() {
    // @Override
    // public void configure() throws Exception {
    // from(aggregateUri)
    // .routeId(aggregateRouteId)
    // .process(exchange -> processAggregateMessage(exchange, agent));
    // }
    // });

    // setupWebSocketIfEnabled(agent);

    // camelContext.getRouteController().startRoute(aggregateRouteId);
    // System.out.println("Aggregate route started for agent: " + agent.getName());
    // }

    public void createAndStartAggregateRoute(Agent agent) throws Exception {
        if (!"opcua".equalsIgnoreCase(agent.getSource().getType())) {
            System.out.println("Agent source type is not OPC UA. Skipping route creation.");
            return;
        }

        String agentName = agent.getName();
        String aggregateRouteId = "aggregate-route-" + agentName;
        String aggregateUri = "direct:" + aggregateRouteId;

        // Stop and remove the aggregate route if it exists
        stopAndRemoveRoute(aggregateRouteId);

        // Add the aggregate route first to ensure it is available before node routes
        // send messages
        camelContext.addRoutes(new RouteBuilder() {
            @Override
            public void configure() throws Exception {
                from(aggregateUri)
                        .routeId(aggregateRouteId)
                        .process(exchange -> processAggregateMessage(exchange, agent));
            }
        });

        // Start the aggregate route to ensure it is ready
        camelContext.getRouteController().startRoute(aggregateRouteId);
        System.out.println("Aggregate route started for agent: " + agent.getName());

        for (OpcUaTag tag : agent.getSubscribedTags()) {
            String opcUaUri = String.format("milo-client:%s?clientId=camel-client-%s&method=subscribe&node=%s",
                    agent.getOpcUaConnection().getEndpointUrl(),
                    agentName, // Use agent name in clientId
                    URLEncoder.encode(tag.getNodeId(), StandardCharsets.UTF_8.name()));

            String nodeRouteId = "node-route-" + agentName + "-" + tag.getNodeId().hashCode();

            // Stop and remove the node route if it exists
            stopAndRemoveRoute(nodeRouteId);

            camelContext.addRoutes(new RouteBuilder() {
                @Override
                public void configure() throws Exception {
                    from(opcUaUri)
                            .routeId(nodeRouteId)
                            .setHeader("CamelMiloNode", constant(tag.getNodeId()))
                            .to(aggregateUri);
                    System.out.println("Route created for OPC UA node: " + tag.getNodeId());
                }
            });

            // Start the node route after it is added
            camelContext.getRouteController().startRoute(nodeRouteId);
        }

        // Setup WebSocket if enabled
        setupWebSocketIfEnabled(agent);
    }

    public void stopRoute(Long agentId) throws Exception {
        String aggregateRouteId = "aggregate-route-" + agentId;

        stopAndRemoveRoute(aggregateRouteId);

        camelContext.getRoutes().stream()
                .filter(route -> route.getId().startsWith("node-route-" + agentId))
                .forEach(route -> {
                    try {
                        camelContext.getRouteController().stopRoute(route.getId());
                        camelContext.removeRoute(route.getId());
                        System.out.println("Node route stopped: " + route.getId());
                    } catch (Exception e) {
                        System.err.println("Failed to stop route: " + route.getId() + " due to " + e.getMessage());
                    }
                });

        Agent agent = agentRepository.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Agent not found with ID: " + agentId));

        if (agent.isWebsocketEnabled()) {
            String agentName = agent.getName();
            // webSocketConfig.removeWebSocketHandler("/" + agentName);
            webSocketConfig.removeDynamicWebSocketHandler("/" + agentName);
            webSocketHandlers.remove(agentName);
            System.out.println("WebSocket handler removed for agent: " + agentName);
        }
    }

    private List<String> buildOpcUaUris(Agent agent) {
        List<String> opcUaUris = new ArrayList<>();
        for (OpcUaTag tag : agent.getSubscribedTags()) {
            String encodedNodeId = URLEncoder.encode(tag.getNodeId(), StandardCharsets.UTF_8);
            opcUaUris.add("milo-client:" + agent.getOpcUaConnection().getEndpointUrl() +
                    "?clientId=camel-client&method=subscribe&node=" + encodedNodeId +
                    "&requestedPublishingInterval=1000");
        }
        return opcUaUris;
    }

    private void stopAndRemoveRoute(String routeId) throws Exception {
        if (camelContext.getRoute(routeId) != null) {
            camelContext.getRouteController().stopRoute(routeId);
            camelContext.removeRoute(routeId);
            System.out.println("Route stopped and removed: " + routeId);
        }
    }

    private void processOpcUaMessage(Exchange exchange, String opcUaUri, Agent agent) {
        DataValue dataValue = exchange.getIn().getBody(DataValue.class);
        String nodeId = opcUaUri.substring(opcUaUri.indexOf("&node=") + 6);
        Variant value = dataValue.getValue();
        StatusCode statusCode = dataValue.getStatusCode();

        if (statusCode.isGood()) {
            String message = String.format("Node: %s, Value: %s", nodeId, value.getValue());
            sendToWebSocket(agent, message);
        } else {
            System.err.println(String.format("Node: %s, Error: %s", nodeId, statusCode));
        }
    }

    private void processAggregateMessage(Exchange exchange, Agent agent) {
        DataValue dataValue = exchange.getIn().getBody(DataValue.class);
        Variant value = dataValue.getValue();
        String nodeId = exchange.getIn().getHeader("CamelMiloNode", String.class);

        if (dataValue.getStatusCode().isGood()) {
            String message = String.format("Node: %s, Value: %s", nodeId, value.getValue());
            sendToWebSocket(agent, message);
        } else {
            System.err.println("Error processing node: " + nodeId);
        }
    }

    private void sendToWebSocket(Agent agent, String message) {
        if (agent.isWebsocketEnabled()) {
            OPCUAWebSocketHandler handler = webSocketHandlers.get(agent.getName());
            if (handler != null) {
                try {
                    handler.sendMessageToAll(message);
                } catch (IOException e) {
                    System.err.println("Failed to send WebSocket message: " + e.getMessage());
                }
            }
        }
    }

    private void setupWebSocketIfEnabled(Agent agent) {
        if (agent.isWebsocketEnabled()) {
            String agentName = agent.getName();
            OPCUAWebSocketHandler handler = webSocketHandlers.computeIfAbsent(agentName,
                    name -> new OPCUAWebSocketHandler());
            // webSocketConfig.addWebSocketHandler("/" + agentName, handler); // Dynamically
            // register the handler
            webSocketConfig.addDynamicWebSocketHandler("/" + agentName, handler); //
            // Dynamically register the handler
            System.out.println("WebSocket handler added for agent: " + agentName);
        }
    }

}
