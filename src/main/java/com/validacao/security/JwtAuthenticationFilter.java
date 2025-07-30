package com.validacao.security;

import com.validacao.service.JwtService;
import com.validacao.service.EmpresaService;
import com.validacao.model.Empresa;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Optional;


public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final EmpresaService empresaService;

    public JwtAuthenticationFilter(JwtService jwtService, EmpresaService empresaService) {
        this.jwtService = jwtService;
        this.empresaService = empresaService;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        String token = null;
        String cnpj = null;

        // Verificar se o header Authorization existe e tem o formato correto
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
            cnpj = jwtService.extractCnpj(token);
        }

        // Se temos um CNPJ válido e não há autenticação no contexto
        if (cnpj != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            
            // Buscar empresa no banco
            Optional<Empresa> empresaOpt = empresaService.buscarPorCnpj(cnpj);
            
            if (empresaOpt.isPresent()) {
                Empresa empresa = empresaOpt.get();
                
                // Validar token
                if (jwtService.validateToken(token) != null) {
                    // Criar autenticação com role baseada no tipo da empresa
                    SimpleGrantedAuthority authority = new SimpleGrantedAuthority(empresa.getTipo().toString());
                    
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            empresa, 
                            null, 
                            Collections.singletonList(authority)
                    );
                    
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        }

        filterChain.doFilter(request, response);
    }
}
