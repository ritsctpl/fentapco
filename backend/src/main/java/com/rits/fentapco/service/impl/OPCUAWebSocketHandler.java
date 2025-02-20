// package com.rits.fentapco.service.impl;

// import org.springframework.stereotype.Component;
// import org.springframework.web.socket.CloseStatus;
// import org.springframework.web.socket.TextMessage;
// import org.springframework.web.socket.WebSocketSession;
// import org.springframework.web.socket.handler.TextWebSocketHandler;

// import java.io.IOException;
// import java.util.concurrent.CopyOnWriteArraySet;

// @Component
// public class OPCUAWebSocketHandler extends TextWebSocketHandler {

//     private final CopyOnWriteArraySet<WebSocketSession> sessions = new CopyOnWriteArraySet<>();

//     // @Override
//     // public void afterConnectionEstablished(WebSocketSession session) {
//     // sessions.add(session);
//     // }

//     // @Override
//     // public void afterConnectionClosed(WebSocketSession session, CloseStatus
//     // status) {
//     // sessions.remove(session);
//     // }

//     public void sendMessageToAll(String message) throws IOException {
//         for (WebSocketSession session : sessions) {
//             session.sendMessage(new TextMessage(message));
//         }
//     }

//     @Override
//     public void afterConnectionEstablished(WebSocketSession session) throws Exception {
//         System.out.println("WebSocket connection established: " + session.getId());
//         super.afterConnectionEstablished(session);
//     }

//     @Override
//     protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
//         System.out.println("Received message: " + message.getPayload() + " from session: " + session.getId());
//         super.handleTextMessage(session, message);
//     }

//     @Override
//     public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
//         System.out.println("WebSocket connection closed. Session ID: " + session.getId() + ", Status: " + status);
//         super.afterConnectionClosed(session, status);
//     }

// }
package com.rits.fentapco.service.impl;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.concurrent.CopyOnWriteArraySet;

@Component
public class OPCUAWebSocketHandler extends TextWebSocketHandler {

    private final CopyOnWriteArraySet<WebSocketSession> sessions = new CopyOnWriteArraySet<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        sessions.add(session);
        System.out.println("WebSocket connection established: " + session.getId());
        super.afterConnectionEstablished(session);
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

    public void sendMessageToAll(String message) throws IOException {
        for (WebSocketSession session : sessions) {
            session.sendMessage(new TextMessage(message));
        }
    }
}
