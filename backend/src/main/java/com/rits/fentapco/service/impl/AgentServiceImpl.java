/* package com.rits.fentapco.service.impl;

import com.rits.fentapco.model.Agent;
import com.rits.fentapco.model.Notification;
import com.rits.fentapco.repository.AgentRepository;
import com.rits.fentapco.service.AgentService;
import com.rits.fentapco.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;
import com.rits.fentapco.model.Source;

import java.util.List;

@Service
public class AgentServiceImpl implements AgentService {

    @Autowired
    private AgentRepository agentRepository;

    @Autowired
    private NotificationService notificationService;

    @Override
    public void associateSource(Long agentId, Source source) {
        Agent agent = agentRepository.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Agent not found with ID: " + agentId));

        // Associate source with the agent
        agent.setSource(source);
        agentRepository.save(agent);
    }

    @Override
    public void createTrigger(Long agentId, String nodeId) throws Exception {
        Agent agent = agentRepository.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Agent not found with ID: " + agentId));

        // Ensure the agent has a source
        if (agent.getSource() == null) {
            throw new RuntimeException("No source associated with the agent");
        }

        // Implement the trigger creation logic (e.g., using Camel for monitoring)
        // For now, we're just printing a placeholder log
        System.out.println("Creating a trigger for agent " + agentId + " on node: " + nodeId);

        // Example: Add a new notification linked to this trigger
        Notification notification = new Notification();
        notification.setAgent(agent);
        notification.setNodeId(nodeId);
        notification.setCondition("value > 50"); // Example condition
        notification.setActionType("log"); // Example action

        notificationService.saveNotification(notification);
    }

    // Other methods (startAgent, stopAgent, etc.) remain the same
    @Override
    public void startAgent(Long agentId) {
        Agent agent = agentRepository.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Agent not found with ID: " + agentId));
        agent.setActive(true);
        agentRepository.save(agent);

        if (agent.getNotifications() != null) {
            for (Notification notification : agent.getNotifications()) {
                notificationService.triggerNotification(notification, null);
            }
        }
    }

    @Override
    public void stopAgent(Long agentId) {
        Agent agent = agentRepository.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Agent not found with ID: " + agentId));
        agent.setActive(false);
        agentRepository.save(agent);
    }

    @Override
    public List<Agent> getAllAgents() {
        return agentRepository.findAll();
    }

    @Override
    public Optional<Agent> getAgentById(Long id) {
        return agentRepository.findById(id);
    }

    @Override
    public Agent saveAgent(Agent agent) {
        return agentRepository.save(agent);
    }

    @Override
    public void deleteAgent(Long id) {
        agentRepository.deleteById(id);
    }
}
 */
package com.rits.fentapco.service.impl;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rits.fentapco.configuration.WebSocketServerConfig;
import com.rits.fentapco.model.Agent;
import com.rits.fentapco.model.OpcUaConnection;
import com.rits.fentapco.model.OpcUaTag;
import com.rits.fentapco.model.Source;
import com.rits.fentapco.repository.AgentRepository;
import com.rits.fentapco.service.AgentService;
import com.rits.fentapco.service.OpcUaConnectionService;
import com.rits.fentapco.service.SourceService;

@Service
public class AgentServiceImpl implements AgentService {

    @Autowired
    private AgentRepository agentRepository;

    @Autowired
    private OpcUaConnectionService opcUaConnectionService;

    @Autowired
    private SourceService sourceService;

    @Autowired
    private AgentRouteBuilder agentRouteBuilder;

    @Autowired
    private WebSocketServerConfig webSocketConfig;

    private final Map<String, OPCUAWebSocketHandler> webSocketHandlers = new ConcurrentHashMap<>();

    @Value("${websocket.port:9090}")
    private int websocketPort;

    @Override
    public List<Agent> getAllAgents() {
        return agentRepository.findAll();
    }

    @Override
    public Optional<Agent> getAgentById(Long id) {
        return agentRepository.findById(id);
    }

    @Override
    public Agent saveAgent(Agent agent) {
        return agentRepository.save(agent);
    }

    @Override
    public void deleteAgent(Long id) {
        Agent agent = agentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agent not found with ID: " + id));
        agentRepository.delete(agent);
    }

    @Override
    @Transactional
    public boolean startAgent(Long id) {
        Agent agent = agentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agent not found with ID: " + id));

        if (!"opcua".equalsIgnoreCase(agent.getSource().getType())) {
            throw new IllegalArgumentException("Agent source type must be OPC UA to start.");
        }

        try {
            // Create and start the aggregate route for the agent
            agentRouteBuilder.createAndStartAggregateRoute(agent);

            // Dynamically register WebSocket handler if enabled
            /*
             * if (agent.isWebsocketEnabled()) {
             * String agentName = agent.getName();
             * 
             * // Check if the handler is already registered
             * if (!webSocketHandlers.containsKey(agentName)) {
             * OPCUAWebSocketHandler handler = new OPCUAWebSocketHandler();
             * webSocketHandlers.put(agentName, handler);
             * 
             * // Dynamically add WebSocket handler
             * webSocketConfig.addWebSocketHandler(agentName, handler);
             * 
             * System.out.println("WebSocket handler registered for agent: " + agentName);
             * } else {
             * System.out.println("WebSocket handler for agent: " + agentName +
             * " is already registered.");
             * }
             * }
             */

            // Update agent status
            agent.setActive(true);
            agentRepository.save(agent);

            System.out.println("Agent started with ID: " + id);
            return true;
        } catch (Exception e) {
            System.err.println("Failed to start agent: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    @Override
    @Transactional
    public boolean stopAgent(Long id) {
        Agent agent = agentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agent not found with ID: " + id));

        try {
            // Stop the aggregate route for the agent
            agentRouteBuilder.stopRoute(agent);

            /*
             * // Unregister WebSocket handler if enabled
             * if (agent.isWebsocketEnabled()) {
             * String agentName = agent.getName();
             * String url = String.format("ws://localhost:%d/%s", websocketPort, agentName);
             * OPCUAWebSocketHandler handler = webSocketHandlers.get(agentName);
             * // OPCUAWebSocketHandler handler = webSocketHandlers.remove(url);
             * 
             * if (handler != null) {
             * webSocketConfig.removeWebSocketHandler(9090, agentName);
             * webSocketHandlers.remove(agentName); // Remove after ensuring cleanup
             * System.out.println("WebSocket handler unregistered for agent: " + agentName +
             * " at URL: " + url);
             * }
             * }
             */

            // Update agent status
            agent.setActive(false);
            agentRepository.save(agent);

            System.out.println("Agent stopped with ID: " + id);
            return true;
        } catch (Exception e) {
            System.err.println("Failed to stop agent: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public void associateSource(Long agentId, Source source) {
        Agent agent = agentRepository.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Agent not found with ID: " + agentId));
        agent.setSource(source);
        agentRepository.save(agent);
    }

    @Override
    public boolean subscribeTags(Long agentId, List<String> tagNodeIds) {
        try {
            Agent agent = agentRepository.findById(agentId)
                    .orElseThrow(() -> new RuntimeException("Agent not found with ID: " + agentId));
            OpcUaConnection opcUaConnection = agent.getOpcUaConnection();
            if (opcUaConnection == null) {
                throw new RuntimeException("Agent does not have a valid OPC UA connection.");
            }

            // Clear and update subscribed tags
            List<OpcUaTag> tags = agent.getSubscribedTags();
            // tags.clear();
            // tagNodeIds.forEach(nodeId -> {
            //     OpcUaTag tag = new OpcUaTag();
            //     tag.setNodeId(nodeId);
            //     tag.setTagName(nodeId);
            //     tag.setOpcUaConnection(opcUaConnection);
            //     tag.setAgent(agent);
            //     tags.add(tag);
            // });
            if(tagNodeIds.size() > 0) {
                for (String nodeId : tagNodeIds) {
                    OpcUaTag tag = new OpcUaTag();
                    tag.setNodeId(nodeId);
                    tag.setTagName(nodeId);
                    tag.setOpcUaConnection(opcUaConnection);
                    //tag.setAgent(agent);
                    tags.add(tag);
                }
            }

            agentRepository.save(agent);

            System.out.println("Successfully subscribed to tags: " + tagNodeIds);
            return true;
        } catch (Exception e) {
            System.err.println("Failed to subscribe to tags: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public boolean configurePublishing(Long agentId, String websocketUrl, String sseUrl, boolean websocketEnabled,
            boolean sseEnabled) {
        try {
            Agent agent = agentRepository.findById(agentId)
                    .orElseThrow(() -> new RuntimeException("Agent not found with ID: " + agentId));

            agent.setWebsocketUrl(websocketUrl);
            agent.setSseUrl(sseUrl);
            agent.setWebsocketEnabled(websocketEnabled);
            agent.setSseEnabled(sseEnabled);

            agentRepository.save(agent);

            System.out.println("Publishing configuration updated for agent: " + agentId);
            return true;
        } catch (Exception e) {
            System.err.println("Failed to configure publishing: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
}
