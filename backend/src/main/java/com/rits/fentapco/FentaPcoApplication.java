// package com.rits.fentapco;

// import org.apache.camel.CamelContext;
// import org.apache.camel.ProducerTemplate;
// import org.springframework.boot.SpringApplication;
// import org.springframework.boot.autoconfigure.SpringBootApplication;
// import org.springframework.context.annotation.Bean;
// import org.springframework.web.servlet.config.annotation.CorsRegistry;
// import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// @SpringBootApplication
// public class FentaPcoApplication {

// 	public static void main(String[] args) {
// 		SpringApplication.run(FentaPcoApplication.class, args);
// 	}

// 	@Bean
// 	public ProducerTemplate producerTemplate(CamelContext camelContext) {
// 		return camelContext.createProducerTemplate();
// 	}

// 	@Bean
// 	public WebMvcConfigurer corsConfigurer() {
// 		return new WebMvcConfigurer() {
// 			@Override
// 			public void addCorsMappings(CorsRegistry registry) {
// 				registry.addMapping("/**")
// 					.allowedOrigins("http://localhost:3000")
// 					.allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
// 					.allowedHeaders("*")
// 					.allowCredentials(true);
// 			}
// 		};
// 	}
// }


package com.rits.fentapco;

import org.apache.camel.CamelContext;
import org.apache.camel.ProducerTemplate;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@SpringBootApplication
public class FentaPcoApplication {

    public static void main(String[] args) {
        SpringApplication.run(FentaPcoApplication.class, args);
    }

    @Bean
    public ProducerTemplate producerTemplate(CamelContext camelContext) {
        return camelContext.createProducerTemplate();
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                    .allowedOrigins("http://localhost:3000")  // Allow React frontend
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                    .allowedHeaders("*")
                    .allowCredentials(true);
            }
        };
    }
}

