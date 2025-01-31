package com.rits.fentapco.configuration;

import org.apache.camel.CamelContext;
import org.apache.camel.builder.RouteBuilder;
import org.apache.camel.impl.DefaultCamelContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CamelConfig {

    @Bean
    public CamelContext camelContext() throws Exception {
        CamelContext context = new DefaultCamelContext();
        context.start();
        return context;
    }

    @Bean
    public RouteBuilder opcUaRouteBuilder() {
        return new RouteBuilder() {
            @Override
            public void configure() throws Exception {
                // Define a basic route for OPC UA
                from("direct:opcua")
                        .to("opcua:tcp://localhost:4840?ns=2&s=Temperature")
                        .log("Read OPC UA value: ${body}");
            }
        };
    }
}
