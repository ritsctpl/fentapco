package com.rits.fentapco.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rits.fentapco.model.Notification;
import com.rits.fentapco.service.PcoIdService;
import com.rits.fentapco.service.TagValueCacheService;
import com.rits.fentapco.service.evaluation.AgentConditionEvaluator;
import com.rits.fentapco.util.CorrelationIdGenerator;
import org.apache.camel.CamelContext;
import org.apache.camel.builder.RouteBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class NotificationRouteBuilder extends RouteBuilder {

    @Autowired
    private AgentConditionEvaluator evaluator;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TagValueCacheService tagValueCacheService;

    @Autowired
    private PcoIdService pcoIdService;

    @Override
    public void configure() {
        from("direct:notificationProcessor")
                .routeId("notification-processor-route")
                .process(exchange -> {
                    Notification notification = exchange.getIn().getBody(Notification.class);
                    Map<String, Object> inputData = notification.getInputData();

                    if (evaluator.evaluateCondition(inputData, notification.getCondition())) {
                        String correlationId = CorrelationIdGenerator.generateCorrelationId();

                        // String pcoId = "RPCO001";
                        String pcoId = pcoIdService.getPcoId(); // ✅ Consistent fetch
                        if (notification.getDestination() != null && notification.getDestination().getPcoId() != null) {
                            pcoId = notification.getDestination().getPcoId();
                        } else {
                            System.out.println("⚠️ Warning: PCO ID is null. Using default: " + pcoId);
                        }

                        String apiUrl = notification.getApiUrl() != null
                                ? notification.getApiUrl()
                                : "http://default-api.local/notify";
                        if (notification.getApiUrl() == null) {
                            System.out.println("⚠️ Warning: API URL is null. Using default: " + apiUrl);
                        }
                        String resolvedMessage = resolveTemplate(notification);

                        Map<String, Object> kafkaMessage = new HashMap<>();
                        kafkaMessage.put("correlationId", correlationId);
                        kafkaMessage.put("pcoId", pcoId);
                        kafkaMessage.put("agentId", notification.getId());
                        kafkaMessage.put("apiUrl", apiUrl);
                        // kafkaMessage.put("request", inputData);
                        // kafkaMessage.put("request", resolvedMessage);
                        // 👇 Correct request as a JSON object
                        kafkaMessage.put("request", resolveTemplateAsMap(notification));

                        String topic = pcoId + "-" + notification.getId();
                        System.out.println("📦 Kafka Topic: " + topic);
                        String kafkaBroker = notification.getDestination().getKafkaBrokers();
                        String kafkaUri = String.format("kafka:%s?brokers=%s", topic, kafkaBroker);
                        System.out.println("🔌 Kafka URI: " + kafkaUri);
                        // System.out.println("🔌 Kafka message: " + kafkaMessage);

                        String kafkaMessageJson = objectMapper.writeValueAsString(kafkaMessage);
                        exchange.getContext().createProducerTemplate().sendBody(kafkaUri, kafkaMessageJson);
                        System.out.println("🚀 Notification sent to Kafka (as JSON): " + kafkaMessageJson);
                        // exchange.getContext().createProducerTemplate().sendBody(kafkaUri,
                        // kafkaMessage);

                        // exchange.getContext().createProducerTemplate().sendBody("kafka:" + topic,
                        // kafkaMessage);

                        // System.out.println("🚀 Notification sent to Kafka: " + kafkaMessage);
                    } else {
                        System.out.println("⏭ Condition not met, notification skipped.");
                    }
                });
    }

    public void ensureNotificationProcessorRoute(CamelContext context) throws Exception {
        String routeId = "notification-processor-route";
        var routeStatus = context.getRouteController().getRouteStatus(routeId);

        if (routeStatus == null) {
            System.out.println("⚙️ Registering 'notificationProcessor' route since it's missing.");
            context.addRoutes(this); // triggers configure()
            context.getRouteController().startRoute(routeId);
        } else {
            System.out.println("✅ 'notificationProcessor' route already registered: " + routeStatus);
        }
    }

    private String resolveTemplate(Notification notification) {
        String template = notification.getMessageTemplate();
        if (template == null || template.isEmpty())
            return "{}";

        Map<String, String> aliasMap = notification.getTagAliasMap();
        Long agentId = notification.getAgentId();

        for (Map.Entry<String, String> entry : aliasMap.entrySet()) {
            String alias = entry.getKey();
            String nodeId = entry.getValue();

            Object value = tagValueCacheService.getTagValue(agentId, nodeId);
            template = template.replace("{{" + alias + "}}", value != null ? value.toString() : "null");
        }

        return template;
    }

    private Map<String, Object> resolveTemplateAsMap(Notification notification) {
        String template = notification.getMessageTemplate();
        if (template == null || template.isEmpty())
            return Map.of();

        Map<String, String> aliasMap = notification.getTagAliasMap();
        Long agentId = notification.getAgentId();

        for (Map.Entry<String, String> entry : aliasMap.entrySet()) {
            String alias = entry.getKey();
            String nodeId = entry.getValue();
            Object value = tagValueCacheService.getTagValue(agentId, nodeId);
            template = template.replace("{{" + alias + "}}", value != null ? value.toString() : "null");
        }

        try {
            // 🔄 Convert the resolved string back into a Map
            return objectMapper.readValue(template, Map.class);
        } catch (Exception e) {
            e.printStackTrace();
            return Map.of("error", "Failed to parse template");
        }
    }

    public void addRouteForNotification(Notification notification, CamelContext context) throws Exception {
        String routeId = "notification-" + notification.getId();

        if (context.getRoute(routeId) == null) {
            context.addRoutes(new RouteBuilder() {
                @Override
                public void configure() {
                    from("direct:" + routeId)
                            .routeId(routeId)
                            .process(exchange -> {
                                Map<String, Object> body = exchange.getIn().getBody(Map.class);

                                if (evaluator.evaluateCondition(body, notification.getCondition())) {
                                    String correlationId = CorrelationIdGenerator.generateCorrelationId();

                                    // String pcoId = "RPCO001";
                                    String pcoId = pcoIdService.getPcoId(); // ✅ Consistent fetch
                                    if (notification.getDestination() != null
                                            && notification.getDestination().getPcoId() != null) {
                                        pcoId = notification.getDestination().getPcoId();
                                    } else {
                                        System.out.println("⚠️ Warning: PCO ID is null. Using default: " + pcoId);
                                    }

                                    String apiUrl = notification.getApiUrl() != null
                                            ? notification.getApiUrl()
                                            : "http://default-api.local/notify";
                                    if (notification.getApiUrl() == null) {
                                        System.out.println("⚠️ Warning: API URL is null. Using default: " + apiUrl);
                                    }
                                    String resolvedMessage = resolveTemplate(notification);
                                    Map<String, Object> kafkaMessage = new HashMap<>();
                                    kafkaMessage.put("correlationId", correlationId);
                                    kafkaMessage.put("pcoId", pcoId);
                                    kafkaMessage.put("agentId", String.valueOf(notification.getId()));
                                    kafkaMessage.put("apiUrl", apiUrl);
                                    // kafkaMessage.put("request", body);
                                    // kafkaMessage.put("request", resolvedMessage);
                                    // 👇 Correct request as a JSON object
                                    kafkaMessage.put("request", resolveTemplateAsMap(notification));

                                    String topic = pcoId + "-" + notification.getId();
                                    System.out.println("📦 Kafka Topic: " + topic);
                                    String kafkaBroker = notification.getDestination().getKafkaBrokers(); // assuming
                                                                                                          // this is the
                                                                                                          // new field
                                    String kafkaUri = String.format("kafka:%s?brokers=%s", topic, kafkaBroker);
                                    System.out.println("🔌 Kafka URI: " + kafkaUri);
                                    System.out.println("🔌 Kafka message: " + kafkaMessage);

                                    String kafkaMessageJson = objectMapper.writeValueAsString(kafkaMessage);
                                    exchange.getContext().createProducerTemplate().sendBody(kafkaUri, kafkaMessageJson);
                                    System.out.println("🚀 Notification sent to Kafka (as JSON): " + kafkaMessageJson);
                                    // exchange.getContext().createProducerTemplate().sendBody(kafkaUri,
                                    // kafkaMessage);

                                    // exchange.getContext().createProducerTemplate().sendBody("kafka:" + topic,
                                    // kafkaMessage);

                                    // System.out.println(
                                    // "📤 Notification (" + notification.getId() + ") sent: " + kafkaMessage);
                                } else {
                                    System.out.println("⏭ Condition not met for notification " + notification.getId());
                                }
                            });
                }
            });

            context.getRouteController().startRoute(routeId);
        }
    }
}

// package com.rits.fentapco.service.impl;

// import com.rits.fentapco.model.Notification;
// import com.rits.fentapco.service.evaluation.AgentConditionEvaluator;
// import com.rits.fentapco.util.CorrelationIdGenerator;
// import org.apache.camel.CamelContext;
// import org.apache.camel.builder.RouteBuilder;
// import org.apache.camel.model.RouteDefinition;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.stereotype.Component;

// import java.util.Map;

// @Component
// public class NotificationRouteBuilder extends RouteBuilder {

// @Autowired
// private AgentConditionEvaluator evaluator;

// @Override
// public void configure() {
// System.out.println("✅ NotificationRouteBuilder configure() called.");
// // Static route, can be used for manual testing
// from("direct:notificationProcessor")
// .routeId("notification-processor-route")
// .process(exchange -> {
// var body = exchange.getIn().getBody(Map.class);
// var condition = exchange.getIn().getHeader("condition", String.class);
// var apiUrl = exchange.getIn().getHeader("apiUrl", String.class);
// var pcoId = exchange.getIn().getHeader("pcoId", String.class);
// var agentId = exchange.getIn().getHeader("agentId", String.class);

// if (evaluator.evaluateCondition(body, condition)) {
// String correlationId = CorrelationIdGenerator.generateCorrelationId();

// var kafkaMessage = Map.of(
// "correlationId", correlationId,
// "pcoId", pcoId,
// "agentId", agentId,
// "apiUrl", apiUrl,
// "request", body);

// exchange.getContext().createProducerTemplate()
// .sendBody("kafka:" + pcoId + "-" + agentId, kafkaMessage);

// System.out.println("🚀 Notification sent to Kafka: " + kafkaMessage);
// } else {
// System.out.println("⏭ Condition not met, notification skipped.");
// }
// });
// }

// public void addRouteForNotification(Notification notification, CamelContext
// context) throws Exception {
// String topic = notification.getDestination().getPcoId() + "-" +
// notification.getId();
// String routeId = "notification-" + notification.getId();

// if (context.getRoute(routeId) == null) {
// context.addRoutes(new RouteBuilder() {
// @Override
// public void configure() throws Exception {
// from("direct:" + routeId)
// .routeId(routeId)
// .process(exchange -> {
// var body = exchange.getIn().getBody(Map.class);
// if (evaluator.evaluateCondition(body, notification.getCondition())) {
// String correlationId = CorrelationIdGenerator.generateCorrelationId();

// var kafkaMessage = Map.of(
// "correlationId", correlationId,
// "pcoId", notification.getDestination().getPcoId(),
// "agentId", String.valueOf(notification.getId()),
// "apiUrl", notification.getDestination().getApiUrl(),
// "request", body);

// exchange.getContext().createProducerTemplate()
// .sendBody("kafka:" + topic, kafkaMessage);

// System.out.println(
// "📤 Notification (" + notification.getId() + ") sent: " + kafkaMessage);
// } else {
// System.out.println("⏭ Condition not met for notification " +
// notification.getId());
// }
// });
// }
// });

// context.getRouteController().startRoute(routeId);
// }
// }

// }
