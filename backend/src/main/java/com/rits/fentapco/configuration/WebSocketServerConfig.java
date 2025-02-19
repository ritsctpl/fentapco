package com.rits.fentapco.configuration;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.server.support.WebSocketHandlerMapping;
import org.springframework.web.socket.server.support.WebSocketHttpRequestHandler;

import com.rits.fentapco.service.impl.OPCUAWebSocketHandler;
import com.rits.fentapco.util.ApplicationContextProvider;

@Configuration
@EnableWebSocket
public class WebSocketServerConfig implements WebSocketConfigurer {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketServerConfig.class);

    // A map to maintain dynamic handlers
    private final Map<String, Object> dynamicHandlers = new ConcurrentHashMap<>();

    private final OPCUAWebSocketHandler opcuaWebSocketHandler;

    public WebSocketServerConfig(OPCUAWebSocketHandler opcuaWebSocketHandler) {
        this.opcuaWebSocketHandler = opcuaWebSocketHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        // Static handler registration
        registry.addHandler(opcuaWebSocketHandler, "/opcua-websocket").setAllowedOrigins("*");
        logger.info("Static WebSocket handler registered for path: /opcua-websocket");
    }

    // @Bean
    public WebSocketHandlerMapping webSocketHandlerMapping() {
        WebSocketHandlerMapping handlerMapping = new WebSocketHandlerMapping();
        handlerMapping.setOrder(1); // Ensure WebSocket handlers take priority over HTTP mappings
        updateHandlerMapping(handlerMapping);
        logger.info("WebSocketHandlerMapping initialized.");
        return handlerMapping;
    }
// // ============================================================================
//     /**
//      * Add a dynamic WebSocket handler.
//      */
//     public synchronized void addDynamicWebSocketHandler(String path, OPCUAWebSocketHandler handler) {
//         // dynamicHandlers.put(path, handler);
//         // updateHandlerMapping();
//         // logger.info("Dynamic WebSocket handler added for path: {}", path);
//         WebSocketHttpRequestHandler requestHandler = new WebSocketHttpRequestHandler(handler);
//         dynamicHandlers.put(path, requestHandler); // Use WebSocketHttpRequestHandler instead
//         updateHandlerMapping();
//         logger.info("Dynamic WebSocket handler added for path: {}", path);

//     }

//     /**
//      * Remove a dynamic WebSocket handler.
//      */
//     public synchronized void removeDynamicWebSocketHandler(String path) {
//         if (dynamicHandlers.remove(path) != null) {
//             updateHandlerMapping();
//             logger.info("Dynamic WebSocket handler removed for path: {}", path);
//         } else {
//             logger.warn("No WebSocket handler found for path: {}", path);
//         }
//     }

//     private void updateHandlerMapping() {
//         WebSocketHandlerMapping handlerMapping = ApplicationContextProvider
//                 .getApplicationContext()
//                 .getBean(WebSocketHandlerMapping.class);
//         updateHandlerMapping(handlerMapping);
//     }

//     private void updateHandlerMapping(WebSocketHandlerMapping handlerMapping) {
//         // Map<String, WebSocketHandler> combinedHandlers = new
//         // HashMap<>(dynamicHandlers);
//         // handlerMapping.setUrlMap(combinedHandlers);
//         // try {
//         // // Initialize the handler mapping with the updated URL map
//         // handlerMapping.initApplicationContext();
//         // } catch (Exception e) {
//         // logger.error("Error while updating WebSocketHandlerMapping: {}",
//         // e.getMessage());
//         // }
//         Map<String, Object> combinedHandlers = new HashMap<>(dynamicHandlers);
//         handlerMapping.setUrlMap(combinedHandlers);

//         try {
//             handlerMapping.initApplicationContext();
//         } catch (Exception e) {
//             logger.error("Error initializing WebSocketHandlerMapping: {}", e.getMessage(), e);
//         }
//         logger.info("WebSocketHandlerMapping updated with handlers: {}", combinedHandlers.keySet());
//     }
// }

// //=============================================================================

public synchronized void addDynamicWebSocketHandler(String path, OPCUAWebSocketHandler handler) {
    if (dynamicHandlers.containsKey(path)) {
        logger.warn("WebSocket handler for path {} already exists. Skipping addition.", path);
        return;
    }
    
    WebSocketHttpRequestHandler requestHandler = new WebSocketHttpRequestHandler(handler);
    dynamicHandlers.put(path, requestHandler);
    updateHandlerMapping();
    logger.info("Dynamic WebSocket handler added for path: {}", path);
}

/**
 * Remove a dynamic WebSocket handler.
 */
// public synchronized void removeDynamicWebSocketHandler(String path) {
//     if (dynamicHandlers.remove(path) != null) {
//         updateHandlerMapping();
//         logger.info("Dynamic WebSocket handler removed for path: {}", path);
//     } else {
//         logger.warn("No WebSocket handler found for path: {}", path);
//     }
// }

// public synchronized void removeDynamicWebSocketHandler(String path) {
//     System.out.println("Before removal, handlers: " + dynamicHandlers.keySet());

//     if (dynamicHandlers.remove(path) != null) {
//         updateHandlerMapping();
//         logger.info("Dynamic WebSocket handler removed for path: {}", path);
//     } else {
//         logger.warn("No WebSocket handler found for path: {}", path);
//     }

//     System.out.println("After removal, handlers: " + dynamicHandlers.keySet());
// }

public synchronized void removeDynamicWebSocketHandler(String path) {
    System.out.println("Before removal, handlers: " + dynamicHandlers.keySet());

    // Remove from dynamicHandlers
    if (dynamicHandlers.remove(path) != null) {
        WebSocketHandlerMapping handlerMapping = ApplicationContextProvider
                .getApplicationContext()
                .getBean(WebSocketHandlerMapping.class);
    
        // Get the current handler mappings
        Map<String, Object> combinedHandlers = new HashMap<>(handlerMapping.getUrlMap());
    
        // Print handlers before removal
        System.out.println("Handlers before removal: " + combinedHandlers.keySet());
    
        if (combinedHandlers.remove(path) != null) {
            logger.info("Handler for path {} removed from WebSocketHandlerMapping", path);
        } else {
            logger.warn("Handler for path {} not found in WebSocketHandlerMapping", path);
        }
    
        // Print handlers after removal
        System.out.println("Handlers after removal: " + combinedHandlers.keySet());
    
        handlerMapping.setUrlMap(combinedHandlers);
        updateHandlerMapping(handlerMapping);

        logger.info("Dynamic WebSocket handler removed for path: {}", path);
    } else {
        logger.warn("No WebSocket handler found for path: {}", path);
    }

    System.out.println("After removal, handlers: " + dynamicHandlers.keySet());
}



private void updateHandlerMapping() {
    WebSocketHandlerMapping handlerMapping = ApplicationContextProvider
            .getApplicationContext()
            .getBean(WebSocketHandlerMapping.class);
    updateHandlerMapping(handlerMapping);
}

private void updateHandlerMapping(WebSocketHandlerMapping handlerMapping) {
    Map<String, Object> combinedHandlers = new HashMap<>(handlerMapping.getUrlMap());

    // Merge dynamic handlers without duplicating
    for (Map.Entry<String, Object> entry : dynamicHandlers.entrySet()) {
        if (!combinedHandlers.containsKey(entry.getKey())) {
            combinedHandlers.put(entry.getKey(), entry.getValue());
        } else {
            logger.warn("Handler for path {} already exists. Skipping duplicate mapping.", entry.getKey());
        }
    }

    handlerMapping.setUrlMap(combinedHandlers);

    System.out.println("Handlers after update: " + combinedHandlers.keySet());

    try {
        handlerMapping.initApplicationContext();
        logger.info("WebSocketHandlerMapping updated with handlers: {}", combinedHandlers.keySet());
    } catch (Exception e) {
        logger.error("Error initializing WebSocketHandlerMapping: {}", e.getMessage(), e);
    }
}


// private void updateHandlerMapping(WebSocketHandlerMapping handlerMapping) {
//     Map<String, Object> combinedHandlers = new HashMap<>(handlerMapping.getUrlMap());
    
//     // Merge dynamic handlers without duplicating
//     for (Map.Entry<String, Object> entry : dynamicHandlers.entrySet()) {
//         if (!combinedHandlers.containsKey(entry.getKey())) {
//             combinedHandlers.put(entry.getKey(), entry.getValue());
//         } else {
//             logger.warn("Handler for path {} already exists. Skipping duplicate mapping.", entry.getKey());
//         }
//     }

//     handlerMapping.setUrlMap(combinedHandlers);
    
//     try {
//         handlerMapping.initApplicationContext();
//         logger.info("WebSocketHandlerMapping updated with handlers: {}", combinedHandlers.keySet());
//     } catch (Exception e) {
//         logger.error("Error initializing WebSocketHandlerMapping: {}", e.getMessage(), e);
//     }
// }
}
// package com.rits.fentapco.configuration;

// import org.slf4j.Logger;
// import org.slf4j.LoggerFactory;
// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.web.socket.WebSocketHandler;
// import org.springframework.web.socket.config.annotation.EnableWebSocket;
// import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
// import
// org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
// import org.springframework.web.socket.server.support.WebSocketHandlerMapping;

// import com.rits.fentapco.service.impl.OPCUAWebSocketHandler;
// import com.rits.fentapco.util.ApplicationContextProvider;

// import java.util.HashMap;
// import java.util.Map;
// import java.util.concurrent.ConcurrentHashMap;

// @Configuration
// @EnableWebSocket
// public class WebSocketServerConfig implements WebSocketConfigurer {

// private static final Logger logger =
// LoggerFactory.getLogger(WebSocketServerConfig.class);

// private final Map<String, WebSocketHandler> dynamicHandlers = new
// ConcurrentHashMap<>();
// private final OPCUAWebSocketHandler opcuaWebSocketHandler;

// public WebSocketServerConfig(OPCUAWebSocketHandler opcuaWebSocketHandler) {
// this.opcuaWebSocketHandler = opcuaWebSocketHandler;
// }

// /**
// * Register static WebSocket handlers.
// */
// @Override
// public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
// registry.addHandler(opcuaWebSocketHandler,
// "/opcua-websocket").setAllowedOrigins("*");
// logger.info("Static WebSocket handler registered for path:
// /opcua-websocket");
// }

// /**
// * Bean to manage dynamic WebSocket handlers.
// */
// @Bean
// public WebSocketHandlerMapping webSocketHandlerMapping() {
// WebSocketHandlerMapping handlerMapping = new WebSocketHandlerMapping();
// updateDynamicHandlerMapping(handlerMapping);
// logger.info("WebSocketHandlerMapping initialized for dynamic handlers.");
// return handlerMapping;
// }

// /**
// * Add a dynamic WebSocket handler.
// */
// public synchronized void addDynamicWebSocketHandler(String path,
// WebSocketHandler handler) {
// dynamicHandlers.put(path, handler);
// refreshDynamicHandlerMapping();
// logger.info("Dynamic WebSocket handler added for path: {}", path);
// }

// /**
// * Remove a dynamic WebSocket handler.
// */
// public synchronized void removeDynamicWebSocketHandler(String path) {
// if (dynamicHandlers.remove(path) != null) {
// refreshDynamicHandlerMapping();
// logger.info("Dynamic WebSocket handler removed for path: {}", path);
// } else {
// logger.warn("No WebSocket handler found for path: {}", path);
// }
// }

// /**
// * Update handler mappings with dynamic handlers.
// */
// private void refreshDynamicHandlerMapping() {
// WebSocketHandlerMapping handlerMapping = ApplicationContextProvider
// .getApplicationContext()
// .getBean(WebSocketHandlerMapping.class);
// updateDynamicHandlerMapping(handlerMapping);
// }

// private void updateDynamicHandlerMapping(WebSocketHandlerMapping
// handlerMapping) {
// Map<String, WebSocketHandler> combinedHandlers = new
// HashMap<>(dynamicHandlers);
// handlerMapping.setUrlMap(combinedHandlers);
// logger.info("WebSocketHandlerMapping updated with dynamic handlers: {}",
// combinedHandlers.keySet());
// }
// }
