package com.rits.fentapco.util;

import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.WebSocketHandlerDecorator;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

public class AllowedOriginWebSocketHandler extends WebSocketHandlerDecorator {

    private final String allowedOrigin;

    public AllowedOriginWebSocketHandler(WebSocketHandler delegate, String allowedOrigin) {
        super(delegate);
        this.allowedOrigin = allowedOrigin;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String origin = session.getHandshakeHeaders().getOrigin();
        if (origin != null && !origin.equals(allowedOrigin) && !allowedOrigin.equals("*")) {
            session.close(); // Close session if origin is not allowed
            throw new IllegalStateException("Origin not allowed: " + origin);
        }
        super.afterConnectionEstablished(session);
    }
}
