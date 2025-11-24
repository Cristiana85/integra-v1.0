package com.be.integra.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")  // Abilita CORS per tutti gli endpoint
                .allowedOrigins("http://localhost:4200")  // Consenti richieste da Angular
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")  // Metodi consentiti
                .allowedHeaders("*")  // Consenti tutti gli header
                .allowCredentials(true);  // Consenti credenziali (se necessario)
    }
}
