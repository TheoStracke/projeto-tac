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

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

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
        CorsConfiguration configuration = new CorsConfiguration();
        // Origens permitidas (inclui Vercel e localhost para desenvolvimento)
        configuration.setAllowedOriginPatterns(Arrays.asList(
            "https://projeto-tac-ja9q.vercel.app",
            "https://*.vercel.app",
            "http://localhost:5173"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"));
        // Permite quaisquer cabeçalhos solicitados no preflight (ex.: Authorization, Content-Type, X-Requested-With, etc.)
        configuration.setAllowedHeaders(Arrays.asList("*"));
        // Expõe cabeçalhos úteis ao browser
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}