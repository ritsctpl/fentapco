/* package com.rits.fentapco.controller;

import com.rits.fentapco.model.Agent;
import com.rits.fentapco.model.Source;
import com.rits.fentapco.service.AgentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/agents")
public class AgentController {

    @Autowired
    private AgentService agentService;

    @GetMapping
    public ResponseEntity<List<Agent>> getAllAgents() {
        return ResponseEntity.ok(agentService.getAllAgents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Agent> getAgentById(@PathVariable Long id) {
        Agent agent = agentService.getAgentById(id)
                .orElseThrow(() -> new RuntimeException("Agent not found with ID: " + id));
        return ResponseEntity.ok(agent);
    }

    @PostMapping
    public ResponseEntity<Agent> createAgent(@RequestBody Agent agent) {
        return ResponseEntity.ok(agentService.saveAgent(agent));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAgent(@PathVariable Long id) {
        agentService.deleteAgent(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<Void> startAgent(@PathVariable Long id) {
        agentService.startAgent(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/stop")
    public ResponseEntity<Void> stopAgent(@PathVariable Long id) {
        agentService.stopAgent(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/associate-source")
    public ResponseEntity<Void> associateSource(@PathVariable Long id, @RequestBody Source source) {
        agentService.associateSource(id, source);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/trigger")
    public ResponseEntity<Void> createTrigger(@PathVariable Long id, @RequestParam String nodeId) throws Exception {
        agentService.createTrigger(id, nodeId);
        return ResponseEntity.ok().build();
    }
}
 */

package com.rits.fentapco.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rits.fentapco.configuration.WebSocketServerConfig;
import com.rits.fentapco.dto.PublishingConfigRequest;
import com.rits.fentapco.model.Agent;
import com.rits.fentapco.model.Source;
import com.rits.fentapco.service.AgentService;

@RestController
@RequestMapping("/api/agents")
public class AgentController {

    @Autowired
    private AgentService agentService;

    @Autowired
    private WebSocketServerConfig webSocketServerConfig;

    @GetMapping
    public ResponseEntity<List<Agent>> getAllAgents() {
        return ResponseEntity.ok(agentService.getAllAgents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Agent> getAgentById(@PathVariable Long id) {
        Agent agent = agentService.getAgentById(id)
                .orElseThrow(() -> new RuntimeException("Agent not found with ID: " + id));
        return ResponseEntity.ok(agent);
    }

    @PostMapping
    public ResponseEntity<Agent> createAgent(@RequestBody Agent agent) {
        return ResponseEntity.ok(agentService.saveAgent(agent));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAgent(@PathVariable Long id) {
        agentService.deleteAgent(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<String> startAgent(@PathVariable Long id) {
        boolean isStarted = agentService.startAgent(id);

        if (isStarted) {
            return ResponseEntity.ok("Agent started successfully.");
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to start the agent. Please check the logs for details.");
        }
    }

    @PostMapping("/{id}/stop")
    public ResponseEntity<String> stopAgent(@PathVariable Long id) {
        boolean isStopped = agentService.stopAgent(id);

        if (isStopped) {
            return ResponseEntity.ok("Agent stopped successfully.");
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to stop the agent. Please check the logs for details.");
        }
    }

    @PostMapping("/{id}/associate-source")
    public ResponseEntity<Void> associateSource(@PathVariable Long id, @RequestBody Source source) {
        agentService.associateSource(id, source);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/subscribe-tags")
    public ResponseEntity<Boolean> subscribeTags(@PathVariable Long id, @RequestBody List<String> tagIds) {
        boolean isSubscribed = agentService.subscribeTags(id, tagIds);
        return ResponseEntity.ok(isSubscribed);
    }

    @GetMapping("/{id}/get-subscribed-tags")
    public ResponseEntity<List<String>> getSubscribedTags(@PathVariable Long id)
    {
        List<String> subscribedTags = agentService.getSubscribedTags(id);
        return ResponseEntity.ok(subscribedTags);
    }

    @PostMapping("/configure-publishing")
    public ResponseEntity<Boolean> configurePublishing(@RequestBody PublishingConfigRequest configRequest) {
        boolean isConfigured = agentService.configurePublishing(
                configRequest.getId(),
                configRequest.getWebsocketUrl(),
                configRequest.getSseUrl(),
                configRequest.isWebsocketEnabled(),
                configRequest.isSseEnabled());
        return ResponseEntity.ok(isConfigured);
    }

    // @GetMapping("/websocket-handlers")
    // public Map<String, String> getWebSocketHandlers(@RequestParam int port) {
    // return webSocketServerConfig.getWebSocketHandlersForPort(port);
    // }

}
