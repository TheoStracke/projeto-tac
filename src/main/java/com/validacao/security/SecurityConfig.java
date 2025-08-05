package com.validacao.security;

import com.validacao.service.JwtService;
import com.validacao.service.EmpresaService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.*;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Usar a mesma configuração do application.properties
        String[] origins = allowedOrigins.split(",");
        for (int i = 0; i < origins.length; i++) {
            origins[i] = origins[i].trim();
        }
        
        // Configuração CORS mais robusta para produção
        configuration.setAllowedOrigins(List.of(origins)); // Usar allowedOrigins em vez de allowedOriginPatterns
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(List.of("Authorization", "Content-Type", "Content-Length", "X-Requested-With"));
        configuration.setMaxAge(3600L); // Cache preflight por 1 hora

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Aplicar CORS para todos os endpoints (incluindo /api/**)
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter(JwtService jwtService, EmpresaService empresaService) {
        return new JwtAuthenticationFilter(jwtService, empresaService);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, JwtAuthenticationFilter jwtAuthenticationFilter) throws Exception {
        http
            // CORS deve vir ANTES de qualquer outra configuração
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authz -> authz
                // CORS preflight - DEVE vir primeiro e permitir TUDO
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                
                // Endpoints de teste (sem autenticação)
                .requestMatchers("/test/**").permitAll()
                
                // Endpoints de autenticação (sem /api pois já está no context-path)
                .requestMatchers(HttpMethod.POST, "/auth/login").permitAll()
                .requestMatchers(HttpMethod.POST, "/auth/cadastro").permitAll()

                
                // Health check
                .requestMatchers(HttpMethod.GET, "/health").permitAll()
                
                // Endpoints de aprovação rápida via email (sem autenticação - usam token único)
                .requestMatchers(HttpMethod.GET, "/aprovacao/*/aprovar").permitAll()
                .requestMatchers(HttpMethod.GET, "/aprovacao/*/rejeitar").permitAll()
                .requestMatchers(HttpMethod.GET, "/aprovacao/*/arquivo").permitAll()
                .requestMatchers(HttpMethod.GET, "/aprovacao/*").permitAll()
                .requestMatchers(HttpMethod.POST, "/aprovacao/*").permitAll()
                
                // Endpoints apenas para ESTRADA_FACIL (CNPJs específicos de admin)
                .requestMatchers(HttpMethod.GET, "/documentos/pendentes").hasAuthority("ESTRADA_FACIL")
                .requestMatchers(HttpMethod.POST, "/documentos/*/aprovar").hasAuthority("ESTRADA_FACIL")
                .requestMatchers(HttpMethod.POST, "/documentos/*/rejeitar").hasAuthority("ESTRADA_FACIL")
                
                // Endpoints apenas para DESPACHANTE
                .requestMatchers(HttpMethod.POST, "/documentos/enviar").hasAuthority("DESPACHANTE")
                
                // Endpoints que ambos podem acessar
                .requestMatchers(HttpMethod.GET, "/documentos/empresa/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/documentos/*").authenticated()
                .requestMatchers(HttpMethod.GET, "/documentos/*/arquivo").hasAnyAuthority("ESTRADA_FACIL", "DESPACHANTE")
                
                // Bloquear qualquer outro acesso
                .anyRequest().denyAll()
            )
            // JWT Filter DEPOIS das configurações de CORS
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
