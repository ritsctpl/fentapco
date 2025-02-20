// package com.rits.fentapco.configuration;

// import java.net.InetAddress;
// import org.springframework.stereotype.Component;
// import java.net.UnknownHostException;
// import org.springframework.boot.web.server.ConfigurableWebServerFactory;
// import org.springframework.boot.web.server.WebServerFactoryCustomizer;

// @Component
// public class DynamicServerConfig implements WebServerFactoryCustomizer<ConfigurableWebServerFactory> {
//      @Override
//     public void customize(ConfigurableWebServerFactory factory) {
//         try {
//             String ipAddress = InetAddress.getLocalHost().getHostAddress(); // Get system's IP dynamically
//             //int port = 8787; // Set your dynamic port
            
//             factory.setAddress(InetAddress.getByName(ipAddress));
//             //factory.setPort(port);

//             System.out.println("Server running at: http://" + ipAddress /*+ ":" + port*/);
//         } catch (UnknownHostException e) {
//             e.printStackTrace();
//         }
//     }
// }

package com.rits.fentapco.configuration;

import java.io.FileOutputStream;
import java.io.IOException;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Properties;
import org.springframework.stereotype.Component;
import org.springframework.boot.web.server.ConfigurableWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;

@Component
public class DynamicServerConfig implements WebServerFactoryCustomizer<ConfigurableWebServerFactory> {
    
    private static final String CONFIG_FILE_PATH = "frontend/public/server.properties"; // Update if needed

    @Override
    public void customize(ConfigurableWebServerFactory factory) {
        try {
            String ipAddress = InetAddress.getLocalHost().getHostAddress(); // Get system's IP dynamically
            int port = 8787; // Set your port

            // Set the dynamic IP in the server factory
            factory.setAddress(InetAddress.getByName(ipAddress));
            factory.setPort(port);

            // Save configuration to a properties file
            saveConfigToFile(ipAddress, port);

            System.out.println("Server running at: http://" + ipAddress + ":" + port);
        } catch (UnknownHostException e) {
            e.printStackTrace();
        }
    }

    private void saveConfigToFile(String ip, int port) {
        Properties properties = new Properties();
        properties.setProperty("server.address", ip);
        properties.setProperty("server.port", String.valueOf(port));

        try (FileOutputStream fos = new FileOutputStream(CONFIG_FILE_PATH)) {
            properties.store(fos, "Server Configuration");
            System.out.println("Configuration file written successfully at: " + CONFIG_FILE_PATH);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}

