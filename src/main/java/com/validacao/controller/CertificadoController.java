package com.validacao.controller;

import com.validacao.dto.EnviarCertificadoRequest;
import com.validacao.model.EnvioCertificado;
import com.validacao.service.CertificadoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/certificados")
public class CertificadoController {
    private static final Logger logger = LoggerFactory.getLogger(CertificadoController.class);
    @Autowired
    private CertificadoService certificadoService;

    @PostMapping("/enviar")
    public ResponseEntity<?> enviarCertificado(
            @RequestParam("despachanteId") Long despachanteId,
            @RequestParam("motoristaId") Long motoristaId,
            @RequestParam("arquivo") MultipartFile arquivo,
            @RequestParam(value = "observacoes", required = false) String observacoes,
            Authentication authentication) {
        logger.info("Recebida requisição para enviar documento: despachanteId={}, motoristaId={}, arquivo={}, observacoes={}, user={}",
            despachanteId, motoristaId, arquivo != null ? arquivo.getOriginalFilename() : null, observacoes, authentication != null ? authentication.getName() : null);
        try {
            long start = System.currentTimeMillis();
            if (arquivo == null || arquivo.isEmpty()) {
                logger.warn("Arquivo não enviado ou está vazio");
                return ResponseEntity.badRequest().body(Map.of("error", "Arquivo é obrigatório"));
            }
            String contentType = arquivo.getContentType();
            if (!List.of("application/pdf", "image/jpeg", "image/png", "image/jpg").contains(contentType)) {
                logger.warn("Tipo de arquivo não permitido: {}", contentType);
                return ResponseEntity.badRequest().body(Map.of("error", "Tipo de arquivo não permitido"));
            }
            if (arquivo.getSize() > 10 * 1024 * 1024) {
                logger.warn("Arquivo muito grande: {} bytes", arquivo.getSize());
                return ResponseEntity.badRequest().body(Map.of("error", "Arquivo muito grande. Máximo: 10MB"));
            }
            if (authentication == null) {
                logger.warn("Authentication está nulo");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Usuário não autenticado"));
            }
            EnviarCertificadoRequest request = new EnviarCertificadoRequest();
            request.setDespachanteId(despachanteId);
            request.setMotoristaId(motoristaId);
            request.setObservacoes(observacoes);
            EnvioCertificado resultado = certificadoService.enviarCertificado(request, arquivo, authentication.getName());
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("message", "Certificado enviado com sucesso");
            resp.put("id", resultado.getId());
            long end = System.currentTimeMillis();
            logger.info("Documento enviado com sucesso em {} ms", (end - start));
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            logger.error("Erro ao enviar documento: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Erro interno: " + e.getMessage()));
        }
    }

    @GetMapping("/historico")
    public ResponseEntity<List<EnvioCertificado>> buscarHistorico(
            @RequestParam(required = false) Long despachanteId,
            @RequestParam(required = false) Long motoristaId) {
        List<EnvioCertificado> historico = certificadoService.buscarHistorico(despachanteId, motoristaId);
        return ResponseEntity.ok(historico);
    }
}
