package com.validacao.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import java.util.Map;

@RestController
public class HealthController {

    /**
     * Este endpoint responde em /api/health e pode ser usado para um health check específico.
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        return ResponseEntity.ok(Map.of(
            "status", "OK",
            "message", "Aplicação funcionando"
        ));
    }

    @GetMapping("/")
    public ResponseEntity<Map<String, String>> rootCheck() {
        return ResponseEntity.ok(Map.of("status", "API is running"));
    }
}