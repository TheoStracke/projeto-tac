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

        // Permite domínios explícitos e padrões profissionais (wildcard) para produção
        // Exemplo: https://*.vercel.app, https://projeto-tac.vercel.app, etc
        String[] originPatterns = allowedOrigins.split(",");
        for (int i = 0; i < originPatterns.length; i++) {
            originPatterns[i] = originPatterns[i].trim();
        }
        configuration.setAllowedOriginPatterns(List.of(originPatterns));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
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
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authz -> authz
                // Permite acesso público para o health check do Railway
                .requestMatchers("/health").permitAll()
                
                // Permite acesso público à raiz da aplicação
                .requestMatchers("/").permitAll()

                // Permite todos os requests de pre-flight (OPTIONS) para o CORS
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                
                // Permite acesso público aos endpoints da API para autenticação e aprovação
                .requestMatchers(
                    "/api/auth/**",       // Para login e cadastro
                    "/api/aprovacao/**"   // Para os links de aprovação por e-mail
                ).permitAll()
                
                // Exige autenticação para qualquer outro request
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}