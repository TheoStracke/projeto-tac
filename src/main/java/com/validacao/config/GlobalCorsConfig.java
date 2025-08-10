package com.validacao.config;

import org.springframework.context.annotation.Configuration;

/*
@Configuration
public class GlobalCorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                    .allowedOriginPatterns("*")
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH")
                    .allowedHeaders("*")
                    .allowCredentials(true);
            }
        };
    }
}
*/

// A configuração de CORS foi centralizada em SecurityConfig para evitar conflitos.
// Esta classe foi desativada.
@Configuration
public class GlobalCorsConfig {
    // Intencionalmente vazia.
}
