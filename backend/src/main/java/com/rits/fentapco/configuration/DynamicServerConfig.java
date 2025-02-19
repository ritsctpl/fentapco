package com.rits.fentapco.configuration;

import java.net.InetAddress;
import org.springframework.stereotype.Component;
import java.net.UnknownHostException;
import org.springframework.boot.web.server.ConfigurableWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;

@Component
public class DynamicServerConfig implements WebServerFactoryCustomizer<ConfigurableWebServerFactory> {
     @Override
    public void customize(ConfigurableWebServerFactory factory) {
        try {
            String ipAddress = InetAddress.getLocalHost().getHostAddress(); // Get system's IP dynamically
            //int port = 8787; // Set your dynamic port
            
            factory.setAddress(InetAddress.getByName(ipAddress));
            //factory.setPort(port);

            System.out.println("Server running at: http://" + ipAddress /*+ ":" + port*/);
        } catch (UnknownHostException e) {
            e.printStackTrace();
        }
    }
}
