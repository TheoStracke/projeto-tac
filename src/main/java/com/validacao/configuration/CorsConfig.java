package com.validacao.configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.lang.NonNull;

@Configuration
@EnableWebMvc
public class CorsConfig implements WebMvcConfigurer {

  @Value("${app.cors.allowed-origins}")
  private String allowedOrigins;


@Override
public void addCorsMappings(@NonNull CorsRegistry registry) {
    String[] origins = allowedOrigins.split(",");
    
    // Remover espaços em branco das origens
    for (int i = 0; i < origins.length; i++) {
        origins[i] = origins[i].trim();
    }
    
    registry.addMapping("/**")
        .allowedOriginPatterns(origins) // Usar allowedOriginPatterns em vez de allowedOrigins
        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
        .allowedHeaders("*")
        .allowCredentials(true);
}

  
  
}
