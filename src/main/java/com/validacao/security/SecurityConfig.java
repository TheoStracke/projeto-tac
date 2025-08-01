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
        
        configuration.setAllowedOriginPatterns(List.of(origins)); // Usar allowedOriginPatterns
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

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
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // Preflight CORS
                .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/auth/cadastro").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/test/**").permitAll() // Endpoints de teste
                .requestMatchers(HttpMethod.GET, "/api/test/**").permitAll() // Endpoints de teste GET
                
                // Endpoints de aprovação rápida via email (sem autenticação - usam token único)
                .requestMatchers(HttpMethod.GET, "/aprovacao/*/aprovar").permitAll()
                .requestMatchers(HttpMethod.GET, "/aprovacao/*/rejeitar").permitAll()
                .requestMatchers(HttpMethod.GET, "/aprovacao/*/arquivo").permitAll() // Visualizar arquivo via token
                .requestMatchers(HttpMethod.GET, "/aprovacao/*").permitAll() // Para buscar documento por token
                
                // Endpoints apenas para ESTRADA_FACIL (CNPJs específicos de admin)
                .requestMatchers(HttpMethod.GET, "/documentos/pendentes").hasAuthority("ESTRADA_FACIL")
                .requestMatchers(HttpMethod.POST, "/documentos/*/aprovar").hasAuthority("ESTRADA_FACIL")
                .requestMatchers(HttpMethod.POST, "/documentos/*/rejeitar").hasAuthority("ESTRADA_FACIL")
                .requestMatchers(HttpMethod.POST, "/aprovacao/**").hasAuthority("ESTRADA_FACIL") // POST para aprovação detalhada
                
                .requestMatchers(HttpMethod.POST, "/documentos/enviar").hasAuthority("DESPACHANTE")
                
                // Endpoints que ambos podem acessar
                .requestMatchers(HttpMethod.GET, "/documentos/empresa/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/documentos/*").authenticated() // Buscar documento por ID
                
                // Endpoints de visualização de arquivos - ambos os tipos podem acessar
                .requestMatchers(HttpMethod.GET, "/documentos/*/arquivo").hasAnyAuthority("ESTRADA_FACIL", "DESPACHANTE")
                .requestMatchers("/**").permitAll()

                // Bloquear qualquer outro acesso
                .anyRequest().denyAll()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
