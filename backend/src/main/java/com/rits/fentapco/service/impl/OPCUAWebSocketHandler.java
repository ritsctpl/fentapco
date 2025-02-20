package com.rits.fentapco.service.impl;

import java.io.IOException;
import java.util.concurrent.CopyOnWriteArraySet;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.util.concurrent.CopyOnWriteArraySet;

@Component
public class OPCUAWebSocketHandler extends TextWebSocketHandler {
    private static final Logger logger = LoggerFactory.getLogger(OPCUAWebSocketHandler.class);
    private final CopyOnWriteArraySet<WebSocketSession> sessions = new CopyOnWriteArraySet<>();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private volatile boolean isActive = true;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        if (isActive) {
            sessions.add(session);
            logger.info("WebSocket connection established: {}", session.getId());
        } else {
            session.close(CloseStatus.GOING_AWAY);
            logger.warn("Rejected connection attempt to inactive handler: {}", session.getId());
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        System.out.println("Received message: " + message.getPayload() + " from session: " + session.getId());
        super.handleTextMessage(session, message);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        sessions.remove(session);
        System.out.println("WebSocket connection closed. Session ID: " + session.getId() + ", Status: " + status);
        super.afterConnectionClosed(session, status);
    }

    public void shutdown() {
        isActive = false;
        for (WebSocketSession session : sessions) {
            try {
                session.close(CloseStatus.GOING_AWAY);
            } catch (IOException e) {
                logger.error("Error closing session: {}", e.getMessage());
            }
        }
        sessions.clear();
    }

    public void sendMessageToAll(Object data) {
        if (!isActive) {
            logger.warn("Attempt to send message to inactive handler");
            return;
        }

        try {
            String payload = (data instanceof String) ? (String) data : objectMapper.writeValueAsString(data);
            TextMessage message = new TextMessage(payload);
            
            for (WebSocketSession session : sessions) {
                if (session.isOpen()) {
                    try {
                        session.sendMessage(message);
                    } catch (IOException e) {
                        logger.error("Failed to send message to session {}: {}", session.getId(), e.getMessage());
                        sessions.remove(session);
                    }
                } else {
                    sessions.remove(session);
                }
            }
        } catch (Exception e) {
            logger.error("Failed to process message: {}", e.getMessage());
        }
    }
}
