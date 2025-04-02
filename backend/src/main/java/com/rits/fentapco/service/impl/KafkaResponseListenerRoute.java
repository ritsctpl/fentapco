package com.rits.fentapco.service.impl;

import org.apache.camel.builder.RouteBuilder;
import org.springframework.stereotype.Component;

@Component
public class KafkaResponseListenerRoute extends RouteBuilder {

    @Override
    public void configure() {
        from("kafka:fenta-pco-response-topic?groupId=fenta-response-group")
                .routeId("kafka-response-listener-route")
                .log("📥 Kafka Response: ${body}")
                .to("bean:fentaAgentResponseListener?method=onResponseReceived(${body})");
    }
}
