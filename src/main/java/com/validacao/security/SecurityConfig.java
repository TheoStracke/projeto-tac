package com.validacao.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;

import java.util.Arrays;
import java.util.List;

// Added imports for logging
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // Logger for debugging CORS setup
    private static final Logger log = LoggerFactory.getLogger(SecurityConfig.class);

    private CorsConfiguration buildCorsConfiguration() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("https://projeto-tac-ja9q.vercel.app"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        log.info("[CORS] allowedOrigins: {}", configuration.getAllowedOrigins());
        log.info("[CORS] allowedMethods: {}", configuration.getAllowedMethods());
        log.info("[CORS] allowedHeaders: {}", configuration.getAllowedHeaders());
        log.info("[CORS] allowCredentials: {}", configuration.getAllowCredentials());
        return configuration;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 1. Aplica a configuração CORS que definimos no bean abaixo
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // 2. Desabilita a proteção CSRF (comum para APIs stateless)
            .csrf(csrf -> csrf.disable())

            // 3. Configura a política de sessão para STATELESS
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // 4. Define as regras de autorização para as requisições
            .authorizeHttpRequests(authorize -> authorize
                // Permite requisições OPTIONS sem autenticação (essencial para o preflight do CORS)
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                // Libera o endpoint de login para requisições POST
                .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                // Todas as outras requisições exigem autenticação
                .anyRequest().authenticated()
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", buildCorsConfiguration());
        return source;
    }

    @Bean
    public FilterRegistrationBean<CorsFilter> corsFilterRegistration() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", buildCorsConfiguration());
        FilterRegistrationBean<CorsFilter> registrationBean = new FilterRegistrationBean<>(new CorsFilter(source));
        registrationBean.setOrder(0); // máxima prioridade
        return registrationBean;
    }
}