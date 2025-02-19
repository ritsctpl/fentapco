/* package com.rits.fentapco.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Data
@Entity
@Table(name = "opc_ua_agents")
public class Agent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; // Agent name

    @ManyToOne
    @JoinColumn(name = "opc_ua_connection_id", nullable = false)
    private OpcUaConnection opcUaConnection; // Linked OPC UA connection

    @Column(nullable = false)
    private boolean active; // Indicates if the agent is currently active

    @ManyToOne
    @JoinColumn(name = "source_id")
    private Source source; // Associated source

    @OneToMany(mappedBy = "agent", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Notification> notifications; // Notifications linked to this agent
}
 */
package com.rits.fentapco.model;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "opc_ua_agents")
public class Agent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; // Agent name

    @ManyToOne
    @JoinColumn(name = "opc_ua_connection_id", nullable = false)
    private OpcUaConnection opcUaConnection; // Linked OPC UA connection

    @Column(nullable = false)
    private boolean active; // Indicates if the agent is currently active

    @ManyToOne
    @JoinColumn(name = "source_id")
    private Source source; // Associated source

    // @OneToMany(mappedBy = "agent", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @OneToMany
    @JoinColumn(name = "agent_id") 
    private List<Notification> notifications; // Notifications linked to this agent

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JoinColumn(name = "agent_id") // Foreign key reference
    private List<OpcUaTag> subscribedTags = new ArrayList<>(); // Subscribed tags

    @Column(nullable = true)
    private String websocketUrl; // WebSocket URL for publishing data

    @Column(nullable = true)
    private String sseUrl; // SSE URL for publishing data

    @Column(nullable = false)
    private boolean websocketEnabled; // Whether WebSocket is enabled

    @Column(nullable = false)
    private boolean sseEnabled; // Whether SSE is enabled

    @Column(columnDefinition = "TEXT")
    private String lastMessage;

    // Getter and Setter for subscribedTags
    public List<OpcUaTag> getSubscribedTags() {
        return subscribedTags;
    }

    public void setSubscribedTags(List<OpcUaTag> subscribedTags) {
        this.subscribedTags = subscribedTags;
    }

    // Getter and Setter for WebSocket and SSE
    public String getWebsocketUrl() {
        return websocketUrl;
    }

    public void setWebsocketUrl(String websocketUrl) {
        this.websocketUrl = websocketUrl;
    }

    public String getSseUrl() {
        return sseUrl;
    }

    public void setSseUrl(String sseUrl) {
        this.sseUrl = sseUrl;
    }

    public boolean isWebsocketEnabled() {
        return websocketEnabled;
    }

    public void setWebsocketEnabled(boolean websocketEnabled) {
        this.websocketEnabled = websocketEnabled;
    }

    public boolean isSseEnabled() {
        return sseEnabled;
    }

    public void setSseEnabled(boolean sseEnabled) {
        this.sseEnabled = sseEnabled;
    }

    public String getLastMessage() {
        return lastMessage;
    }

    public void setLastMessage(String lastMessage) {
        this.lastMessage = lastMessage;
    }
}
