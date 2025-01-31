/* package com.rits.fentapco.configuration;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketConfig.class);
    private final Map<String, WebSocketHandler> handlerRegistry = new ConcurrentHashMap<>();

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        handlerRegistry.forEach((url, handler) -> registry.addHandler(handler, url).setAllowedOrigins("*"));
    }

    public synchronized void addWebSocketHandler(String agentName, WebSocketHandler handler) {
        String url = "/" + agentName;
        if (handlerRegistry.containsKey(url)) {
            throw new IllegalStateException("Handler for agent " + agentName + " is already registered.");
        }
        handlerRegistry.put(url, handler);
        logger.info("WebSocket handler registered at URL: {}", url);
    }

    public synchronized void removeWebSocketHandler(String agentName) {
        String url = "/" + agentName;
        if (handlerRegistry.remove(url) != null) {
            logger.info("WebSocket handler removed for URL: {}", url);
        } else {
            logger.warn("No WebSocket handler found for URL: {}", url);
        }
    }
}
 
package com.rits.fentapco.configuration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.web.socket.server.support.WebSocketHandlerMapping;
import com.rits.fentapco.service.impl.OPCUAWebSocketHandler;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

import com.rits.fentapco.util.ApplicationContextProvider;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketConfig.class);
    private final Map<String, OPCUAWebSocketHandler> handlerRegistry = new ConcurrentHashMap<>();

    @Bean
    public WebSocketHandlerMapping webSocketHandlerMapping() {
        WebSocketHandlerMapping mapping = new WebSocketHandlerMapping();

        // Set initial URL mappings from handlerRegistry
        mapping.setUrlMap(new HashMap<>(handlerRegistry));

        // Set order if needed (priority of this handler mapping in Spring's processing
        // chain)
        mapping.setOrder(1); // Higher priority to handle WebSocket requests first

        return mapping;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        // Register statically defined handlers
        handlerRegistry.forEach((url, handler) -> {
            registry.addHandler(handler, url).setAllowedOrigins("*");
            logger.info("WebSocket handler registered at URL: {}", url);
        });
    }

    public synchronized void addWebSocketHandler(String agentName, OPCUAWebSocketHandler handler) {
        String url = "/" + agentName;

        if (handlerRegistry.containsKey(url)) {
            throw new IllegalStateException("Handler for agent " + agentName + " is already registered.");
        }

        // Add the handler to the registry
        handlerRegistry.put(url, handler);

        // Update the WebSocketHandlerMapping bean dynamically
        updateHandlerMapping();
        logger.info("WebSocket handler dynamically added at URL: {}", url);
    }

    public synchronized void removeWebSocketHandler(String agentName) {
        String url = "/" + agentName;

        if (handlerRegistry.remove(url) != null) {
            updateHandlerMapping();
            logger.info("WebSocket handler removed for URL: {}", url);
        } else {
            logger.warn("No WebSocket handler found for URL: {}", url);
        }
    }

    
    private void updateHandlerMapping() {
        WebSocketHandlerMapping mapping = ApplicationContextProvider.getApplicationContext()
                .getBean(WebSocketHandlerMapping.class);

        if (mapping == null) {
            throw new IllegalStateException("WebSocketHandlerMapping bean not found in application context");
        }

        // Update the URL map with the new handlerRegistry
        mapping.setUrlMap(new HashMap<>(handlerRegistry));

        // Re-register the mapping in the application context
        ApplicationContextProvider.getApplicationContext().getAutowireCapableBeanFactory()
                .destroyBean(mapping);
        ApplicationContextProvider.getApplicationContext().getAutowireCapableBeanFactory()
                .initializeBean(mapping, "webSocketHandlerMapping");

        logger.info("WebSocketHandlerMapping dynamically updated and re-registered.");
    }

}


package com.rits.fentapco.configuration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.web.socket.server.support.WebSocketHandlerMapping;
import org.springframework.web.socket.server.support.WebSocketHttpRequestHandler;
import com.rits.fentapco.util.ApplicationContextProvider;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Configuration
public class WebSocketConfig {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketConfig.class);

    @Value("${websocket.port:9090}")
    private int websocketPort;

    private final Map<String, WebSocketHandler> handlerRegistry = new ConcurrentHashMap<>();

    @Bean
    public WebSocketHandlerMapping webSocketHandlerMapping() {
        WebSocketHandlerMapping mapping = new WebSocketHandlerMapping();
        mapping.setOrder(1);
        mapping.setUrlMap(new HashMap<>(handlerRegistry));
        return mapping;
    }

    public synchronized void addWebSocketHandler(String agentName, WebSocketHandler handler) {
        String url = "/" + agentName;

        if (handlerRegistry.containsKey(url)) {
            throw new IllegalStateException("Handler for agent " + agentName + " is already registered.");
        }

        handlerRegistry.put(url, handler);
        updateHandlerMapping();
        logger.info("WebSocket handler dynamically added at URL: {}", url);
    }

    public synchronized void removeWebSocketHandler(String agentName) {
        String url = "/" + agentName;

        if (handlerRegistry.remove(url) != null) {
            updateHandlerMapping();
            logger.info("WebSocket handler removed for URL: {}", url);
        } else {
            logger.warn("No WebSocket handler found for URL: {}", url);
        }
    }

    private void updateHandlerMapping() {
        WebSocketHandlerMapping mapping = ApplicationContextProvider.getApplicationContext()
                .getBean(WebSocketHandlerMapping.class);
        mapping.setUrlMap(new HashMap<>(handlerRegistry));
        logger.info("WebSocketHandlerMapping dynamically updated with handlers: {}", handlerRegistry.keySet());
    }

    public int getWebSocketPort() {
        return websocketPort;
    }

}
*/
package com.rits.fentapco.configuration;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import com.rits.fentapco.service.impl.OPCUAWebSocketHandler;

/* @Configuration
@EnableWebSocket */
public class WebSocketConfig // implements WebSocketConfigurer
{

    // private final OPCUAWebSocketHandler opcuaWebSocketHandler;

    // public WebSocketConfig(OPCUAWebSocketHandler opcuaWebSocketHandler) {
    // this.opcuaWebSocketHandler = opcuaWebSocketHandler;
    // }

    // // @Override
    // public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
    // registry.addHandler(opcuaWebSocketHandler,
    // "/opcua-websocket").setAllowedOrigins("*");
    // }
}
