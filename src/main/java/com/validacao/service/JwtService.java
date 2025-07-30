package com.validacao.service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.interfaces.JWTVerifier;
import com.validacao.model.Empresa;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Service
public class JwtService {
    
    @Value("${jwt.secret:minha-chave-secreta-super-segura-para-desenvolvimento}")
    private String secret;
    
    @Value("${jwt.expiration:86400}") // 24 horas em segundos
    private Long expiration;
    
    public String generateToken(Empresa empresa) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            
            return JWT.create()
                    .withIssuer("validacao-documentos")
                    .withSubject(empresa.getCnpj())
                    .withClaim("empresaId", empresa.getId())
                    .withClaim("razaoSocial", empresa.getRazaoSocial())
                    .withClaim("email", empresa.getEmail())
                    .withClaim("tipo", empresa.getTipo().toString())
                    .withExpiresAt(generateExpirationDate())
                    .sign(algorithm);
                    
        } catch (Exception e) {
            throw new RuntimeException("Erro ao gerar token JWT: " + e.getMessage());
        }
    }
    
    public String validateToken(String token) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            JWTVerifier verifier = JWT.require(algorithm)
                    .withIssuer("validacao-documentos")
                    .build();
                    
            DecodedJWT jwt = verifier.verify(token);
            return jwt.getSubject(); // Retorna o CNPJ
            
        } catch (JWTVerificationException e) {
            return null; // Token inválido
        }
    }
    
    public String extractCnpj(String token) {
        return validateToken(token);
    }
    
    public Long extractEmpresaId(String token) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            JWTVerifier verifier = JWT.require(algorithm)
                    .withIssuer("validacao-documentos")
                    .build();
                    
            DecodedJWT jwt = verifier.verify(token);
            return jwt.getClaim("empresaId").asLong();
            
        } catch (JWTVerificationException e) {
            return null;
        }
    }
    
    public String extractTipo(String token) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            JWTVerifier verifier = JWT.require(algorithm)
                    .withIssuer("validacao-documentos")
                    .build();
                    
            DecodedJWT jwt = verifier.verify(token);
            return jwt.getClaim("tipo").asString();
            
        } catch (JWTVerificationException e) {
            return null;
        }
    }
    
    private Instant generateExpirationDate() {
        return LocalDateTime.now().plusSeconds(expiration).toInstant(ZoneOffset.of("-03:00"));
    }
}
