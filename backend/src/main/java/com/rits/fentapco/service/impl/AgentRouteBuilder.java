package com.rits.fentapco.service.impl;

import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rits.fentapco.configuration.WebSocketServerConfig;
import com.rits.fentapco.model.Agent;
import com.rits.fentapco.model.Notification;
import com.rits.fentapco.model.OpcUaTag;
import com.rits.fentapco.repository.AgentRepository;
import com.rits.fentapco.repository.NotificationRepository;

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
import java.util.stream.Collectors;

import org.apache.camel.Route;


@Component
public class AgentRouteBuilder {

    @Autowired
    private CamelContext camelContext;

    @Autowired
    private AgentRepository agentRepository;

    @Autowired
    private WebSocketServerConfig webSocketConfig;

     @Autowired
    private NotificationRepository notificationRepository;

    private final Map<String, OPCUAWebSocketHandler> webSocketHandlers = new ConcurrentHashMap<>();

    private final ObjectMapper mapper = new ObjectMapper(); // Add this as a class field

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
    //     if (!"opcua".equalsIgnoreCase(agent.getSource().getType())) {
    //         System.out.println("Agent source type is not OPC UA. Skipping route creation.");
    //         return;
    //     }



    //     String agentName = agent.getName();
    //     String aggregateRouteId = "aggregate-route-" + agentName;
    //     String aggregateUri = "direct:" + aggregateRouteId;

    //     // Stop and remove the aggregate route if it exists
    //     stopAndRemoveRoute(aggregateRouteId);

    //     // Add the aggregate route first to ensure it is available before node routes
    //     // send messages
    //     camelContext.addRoutes(new RouteBuilder() {
    //         @Override
    //         public void configure() throws Exception {
    //             from(aggregateUri)
    //                     .routeId(aggregateRouteId)
    //                     .process(exchange -> processAggregateMessage(exchange, agent));
    //         }
    //     });

    //     // Start the aggregate route to ensure it is ready
    //     camelContext.getRouteController().startRoute(aggregateRouteId);
    //     System.out.println("Aggregate route started for agent: " + agent.getName());

    //     for (OpcUaTag tag : agent.getSubscribedTags()) {
    //         String opcUaUri = String.format("milo-client:%s?clientId=camel-client-%s&method=subscribe&node=%s",
    //                 agent.getOpcUaConnection().getEndpointUrl(),
    //                 agentName, // Use agent name in clientId
    //                 URLEncoder.encode(tag.getNodeId(), StandardCharsets.UTF_8.name()));

    //         String nodeRouteId = "node-route-" + agentName + "-" + tag.getNodeId().hashCode();

    //         // Stop and remove the node route if it exists
    //         stopAndRemoveRoute(nodeRouteId);

    //         camelContext.addRoutes(new RouteBuilder() {
    //             @Override
    //             public void configure() throws Exception {
    //                 from(opcUaUri)
    //                         .routeId(nodeRouteId)
    //                         .setHeader("CamelMiloNode", constant(tag.getNodeId()))
    //                         .to(aggregateUri);
    //                 System.out.println("Route created for OPC UA node: " + tag.getNodeId());
    //             }
    //         });

    //         // Start the node route after it is added
    //         camelContext.getRouteController().startRoute(nodeRouteId);
    //     }

    //     // Setup WebSocket if enabled
    //     setupWebSocketIfEnabled(agent);
    // }

    // public void stopRoute(Long agentId) throws Exception {
    //     String aggregateRouteId = "aggregate-route-" + agentId;

    //     stopAndRemoveRoute(aggregateRouteId);
    //     System.out.println("Total routes in CamelContext: " + camelContext.getRoutes().size());

    //     camelContext.getRoutes().stream()
    //             .filter(route -> route.getId().startsWith("node-route-" + agentId))
    //             .forEach(route -> {
    //                 try {
    //                     camelContext.getRouteController().stopRoute(route.getId());
    //                     camelContext.removeRoute(route.getId());
    //                     System.out.println("Node route stopped: " + route.getId());
    //                 } catch (Exception e) {
    //                     System.err.println("Failed to stop route: " + route.getId() + " due to " + e.getMessage());
    //                 }
    //             });

    //     Agent agent = agentRepository.findById(agentId)
    //             .orElseThrow(() -> new RuntimeException("Agent not found with ID: " + agentId));

    //     if (agent.isWebsocketEnabled()) {
    //         String agentName = agent.getName();
    //         // webSocketConfig.removeWebSocketHandler("/" + agentName);
    //         webSocketConfig.removeDynamicWebSocketHandler("/" + agentName);
    //         webSocketHandlers.remove(agentName);
    //         System.out.println("WebSocket handler removed for agent: " + agentName);
    //     }
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
    
        // Add the aggregate route first to ensure it is available before node routes send messages
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
    
    // public void stopRoute(Long agentId) throws Exception {
    //     String aggregateRouteId = "aggregate-route-" + agentId;
    //     stopAndRemoveRoute(aggregateRouteId);
    
    //     System.out.println("Total routes in CamelContext before stopping nodes: " + camelContext.getRoutes().size());
        
    //     camelContext.getRoutes().stream()
    //             .filter(route -> route.getId().startsWith("node-route-" + agentId))
    //             .forEach(route -> {
    //                 try {
    //                     camelContext.getRouteController().stopRoute(route.getId());
    //                     camelContext.removeRoute(route.getId());
    //                     System.out.println("Node route stopped: " + route.getId());
    //                 } catch (Exception e) {
    //                     System.err.println("Failed to stop route: " + route.getId() + " due to " + e.getMessage());
    //                 }
    //             });
        
    //     System.out.println("Total routes in CamelContext after stopping nodes: " + camelContext.getRoutes().size());
    
    //     Agent agent = agentRepository.findById(agentId)
    //             .orElseThrow(() -> new RuntimeException("Agent not found with ID: " + agentId));
    
    //     if (agent.isWebsocketEnabled()) {
    //         String agentName = agent.getName();
    //         webSocketConfig.removeDynamicWebSocketHandler("/" + agentName);
    //         webSocketHandlers.remove(agentName);
    //         System.out.println("WebSocket handler removed for agent: " + agentName);
    //     }
    // }

    public void stopRoute(Agent agent) throws Exception {
        String aggregateRouteId = "aggregate-route-" + agent.getName();
        stopAndRemoveRoute(aggregateRouteId);
    
        System.out.println("Total routes in CamelContext before stopping nodes: " + camelContext.getRoutes().size());
        // List<String> nodeRouteIds = new ArrayList<>();
        // for (OpcUaTag tag : agent.getSubscribedTags()) {
    
        //     String nodeRouteId = "node-route-" + agent.getName() + "-" + tag.getNodeId().hashCode();
        //     nodeRouteIds.add(nodeRouteId);
        // }
        List<Route> matchedRoutes = camelContext.getRoutes().stream()
                .filter(route -> {
                    boolean matches = route.getId().startsWith("node-route-" + agent.getName());
                    System.out.println("Checking route: " + route.getId() + " - Matches: " + matches);
                    return matches;
                })
                .collect(Collectors.toList());
    
        if (matchedRoutes.isEmpty()) {
            System.out.println("No matching routes found for agentId: " + agent.getName());
        } else {
            matchedRoutes.forEach(route -> {
                try {
                    System.out.println("Stopping route: " + route.getId());
                    camelContext.getRouteController().stopRoute(route.getId());
                    camelContext.removeRoute(route.getId());
                    System.out.println("Node route stopped and removed: " + route.getId());
                } catch (Exception e) {
                    System.err.println("Failed to stop route: " + route.getId() + " due to " + e.getMessage());
                }
            });
        }
    
        System.out.println("Total routes in CamelContext after stopping nodes: " + camelContext.getRoutes().size());
    
        // Agent agent = agentRepository.findById(agentId)
        //         .orElseThrow(() -> new RuntimeException("Agent not found with ID: " + agentId));
    
        if (agent.isWebsocketEnabled()) {
            String agentName = agent.getName();
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
            try {
                String resource ="",name="";
                String tagPath = nodeId.substring(nodeId.indexOf(']') + 1);
                String[] parts = tagPath.split("/");

                if (parts.length == 2) {
                     resource = parts[0];
                     name = parts[1];
                    
                } else {
                    System.out.println("Invalid input format");
                }

                Notification notifications = notificationRepository.findByNodeIdAndAgentId(nodeId,agent.getId());
            
            boolean shouldSend = false;
           if(!notifications.getCondition().equalsIgnoreCase("none")){
            shouldSend = evaluateCondition(notifications, value);
           }
                
            if (shouldSend) {
                ObjectNode jsonNode = mapper.createObjectNode();
                jsonNode.put("resource", resource);
                jsonNode.put(name, value.getValue().toString());

                String jsonMessage = mapper.writeValueAsString(jsonNode);
                sendToWebSocket(agent, jsonMessage);
            }

                // ObjectNode jsonNode = mapper.createObjectNode();
                // jsonNode.put("resource", resource);
                // jsonNode.put(name, value.getValue().toString());
                
                // String jsonMessage = mapper.writeValueAsString(jsonNode);
                // sendToWebSocket(agent, jsonMessage);
            } catch (Exception e) {
                System.err.println("Error creating JSON message: " + e.getMessage());
            }
        } else {
            System.err.println(String.format("Node: %s, Error: %s", nodeId, statusCode));
        }
    }

    private boolean evaluateCondition(Notification notification, Variant value) {
        try {
            Object actualValue = value.getValue(); // Get the actual value from Variant
    
            if (actualValue instanceof Number) {
                double numericValue = ((Number) actualValue).doubleValue(); // Convert to double
                String condition = notification.getCondition();
    
                switch (condition) {
                    case "Greater than":
                        return numericValue > Double.parseDouble(notification.getValue());
                    case "Less than":
                        return numericValue < Double.parseDouble(notification.getValue());
                    case "Equal to":
                        return numericValue == Double.parseDouble(notification.getValue());
                    case "BETWEEN":
                        return numericValue >= notification.getMin() && numericValue <= notification.getMax();
                    default:
                        return false;
                }
            } 
            else if (actualValue instanceof Boolean) {
                boolean boolValue = (Boolean) actualValue;
                String condition = notification.getCondition().toLowerCase();
    
                switch (condition) {
                    case "true":
                        return boolValue;  // Returns true if value is true
                    case "false":
                        return !boolValue; // Returns true if value is false
                    default:
                        return false;
                }
            } 
            else if (actualValue instanceof String) {
                String stringValue = (String) actualValue;
                String condition = notification.getCondition().toLowerCase();
    
                switch (condition) {
                    case "equal to":
                        return stringValue.equalsIgnoreCase(notification.getValue());  
                    default:
                        return false;
                }
            } 
            else {
                System.err.println("Unsupported value type for condition check: " + actualValue.getClass().getSimpleName());
                return false;
            }
        } catch (Exception e) {
            System.err.println("Error parsing value for condition check: " + e.getMessage());
            return false;
        }
    }
    

    // private void processAggregateMessage(Exchange exchange, Agent agent) {
    //     DataValue dataValue = exchange.getIn().getBody(DataValue.class);
    //     Variant value = dataValue.getValue();
    //     String nodeId = exchange.getIn().getHeader("CamelMiloNode", String.class);
    
    //     if (dataValue.getStatusCode().isGood()) {
    //         try {
    //             String station = "", resourceName = "";
    //             String tagPath = nodeId.substring(nodeId.indexOf(']') + 1);
    //             String[] parts = tagPath.split("/");

    //             if (parts.length == 2) {
    //                 station = parts[0];
    //                 resourceName = parts[1];
    //             } else {
    //                 System.out.println("Invalid input format");
    //                 return;
    //             }

    //             // Create or get existing array node
    //             ArrayNode arrayNode;
    //             if (agent.getLastMessage() == null) {
    //                 arrayNode = mapper.createArrayNode();
    //             } else {
    //                 arrayNode = (ArrayNode) mapper.readTree(agent.getLastMessage());
    //             }

    //             // Find or create station object
    //             ObjectNode stationNode = null;
    //             for (JsonNode node : arrayNode) {
    //                 if (node.get("id").asText().equals(station)) {
    //                     stationNode = (ObjectNode) node;
    //                     break;
    //                 }
    //             }

    //             if (stationNode == null) {
    //                 stationNode = mapper.createObjectNode();
    //                 stationNode.put("id", station);
    //                 stationNode.put("station", station);
    //                 stationNode.set("resources", mapper.createArrayNode());
    //                 arrayNode.add(stationNode);
    //             }

    //             // Add or update resource
    //             ArrayNode resources = (ArrayNode) stationNode.get("resources");
    //             boolean resourceFound = false;
    //             for (JsonNode resource : resources) {
    //                 if (resource.get("name").asText().equals(resourceName)) {
    //                     ((ObjectNode) resource).put("value", value.getValue().toString());
    //                     resourceFound = true;
    //                     break;
    //                 }
    //             }

    //             if (!resourceFound) {
    //                 ObjectNode resourceNode = mapper.createObjectNode();
    //                 resourceNode.put("name", resourceName);
    //                 resourceNode.put("value", value.getValue().toString());
    //                 resources.add(resourceNode);
    //             }

    //             // Store the updated message and send it
    //             String jsonMessage = mapper.writeValueAsString(arrayNode);
    //             agent.setLastMessage(jsonMessage);
    //             sendToWebSocket(agent, jsonMessage);

    //         } catch (Exception e) {
    //             System.err.println("Error creating JSON message: " + e.getMessage());
    //         }
    //     } else {
    //         System.err.println("Error processing node: " + nodeId);
    //     }
    // }


    private void processAggregateMessage(Exchange exchange, Agent agent) {
        DataValue dataValue = exchange.getIn().getBody(DataValue.class);
        Variant value = dataValue.getValue();
        String nodeId = exchange.getIn().getHeader("CamelMiloNode", String.class);
    
        if (dataValue.getStatusCode().isGood()) {
            try {
                String station = "", resourceName = "";
                String tagPath = nodeId.substring(nodeId.indexOf(']') + 1);
                String[] parts = tagPath.split("/");
    
                if (parts.length == 2) {
                    station = parts[0];
                    resourceName = parts[1];
                } else {
                    System.out.println("Invalid input format");
                    return;
                }
    
                // Fetch notification condition for filtering
                Notification notification = notificationRepository.findByNodeIdAndAgentId(nodeId, agent.getId());
                boolean shouldSend = false;
    
                if (notification != null && !notification.getCondition().equalsIgnoreCase("none")) {
                    shouldSend = evaluateCondition(notification, value);
                } else {
                    shouldSend = true; // If no condition is set, allow message to pass
                }
    
                if (shouldSend) {
                    // Create or get existing array node
                    ArrayNode arrayNode;
                    if (agent.getLastMessage() == null) {
                        arrayNode = mapper.createArrayNode();
                    } else {
                        arrayNode = (ArrayNode) mapper.readTree(agent.getLastMessage());
                    }
    
                    // Find or create station object
                    ObjectNode stationNode = null;
                    for (JsonNode node : arrayNode) {
                        if (node.get("id").asText().equals(station)) {
                            stationNode = (ObjectNode) node;
                            break;
                        }
                    }
    
                    if (stationNode == null) {
                        stationNode = mapper.createObjectNode();
                        stationNode.put("id", station);
                        stationNode.put("station", station);
                        stationNode.set("resources", mapper.createArrayNode());
                        arrayNode.add(stationNode);
                    }
    
                    // Add or update resource
                    ArrayNode resources = (ArrayNode) stationNode.get("resources");
                    boolean resourceFound = false;
                    for (JsonNode resource : resources) {
                        if (resource.get("name").asText().equals(resourceName)) {
                            ((ObjectNode) resource).put("value", value.getValue().toString());
                            resourceFound = true;
                            break;
                        }
                    }
    
                    if (!resourceFound) {
                        ObjectNode resourceNode = mapper.createObjectNode();
                        resourceNode.put("name", resourceName);
                        resourceNode.put("value", value.getValue().toString());
                        resources.add(resourceNode);
                    }
    
                    // Store the updated message and send it
                    String jsonMessage = mapper.writeValueAsString(arrayNode);
                    agent.setLastMessage(jsonMessage);
                    sendToWebSocket(agent, jsonMessage);
                }
            } catch (Exception e) {
                System.err.println("Error creating JSON message: " + e.getMessage());
            }
        } else {
            System.err.println("Error processing node: " + nodeId);
        }
    }
    

    private void sendToWebSocket(Agent agent, String message) {
        if (agent.isWebsocketEnabled()) {
            OPCUAWebSocketHandler handler = webSocketHandlers.get(agent.getName());
            if (handler != null) {
               
                    handler.sendMessageToAll(message);
                
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

    // private void processOpcUaMessage(Exchange exchange, String opcUaUri, Agent agent) {
    //     DataValue dataValue = exchange.getIn().getBody(DataValue.class);
    //     String nodeId = opcUaUri.substring(opcUaUri.indexOf("&node=") + 6);
    //     Variant value = dataValue.getValue();
    //     StatusCode statusCode = dataValue.getStatusCode();

    //     if (statusCode.isGood()) {
    //         String message = String.format("Node: %s, Value: %s", nodeId, value.getValue());
    //         sendToWebSocket(agent, message);
    //     } else {
    //         System.err.println(String.format("Node: %s, Error: %s", nodeId, statusCode));
    //     }
    // }

    // private void processAggregateMessage(Exchange exchange, Agent agent) {
    //     DataValue dataValue = exchange.getIn().getBody(DataValue.class);
    //     Variant value = dataValue.getValue();
    //     String nodeId = exchange.getIn().getHeader("CamelMiloNode", String.class);

    //     if (dataValue.getStatusCode().isGood()) {
    //         String message = String.format("Node: %s, Value: %s", nodeId, value.getValue());
    //         sendToWebSocket(agent, message);
    //     } else {
    //         System.err.println("Error processing node: " + nodeId);
    //     }
    // }

    // private void sendToWebSocket(Agent agent, String message) {
    //     if (agent.isWebsocketEnabled()) {
    //         OPCUAWebSocketHandler handler = webSocketHandlers.get(agent.getName());
    //         if (handler != null) {
                
    //                 handler.sendMessageToAll(message);
                
    //         }
    //     }
    // }

    // private void setupWebSocketIfEnabled(Agent agent) {
    //     if (agent.isWebsocketEnabled()) {
    //         String agentName = agent.getName();
    //         OPCUAWebSocketHandler handler = webSocketHandlers.computeIfAbsent(agentName,
    //                 name -> new OPCUAWebSocketHandler());
    //         // webSocketConfig.addWebSocketHandler("/" + agentName, handler); // Dynamically
    //         // register the handler
    //         webSocketConfig.addDynamicWebSocketHandler("/" + agentName, handler); //
    //         // Dynamically register the handler
    //         System.out.println("WebSocket handler added for agent: " + agentName);
    //     }
    // }

}
