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
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.EnableAsync;

import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/certificados")
@EnableAsync
public class CertificadoController {
    private static final Logger logger = LoggerFactory.getLogger(CertificadoController.class);
    @Autowired
    private CertificadoService certificadoService;

    @PostMapping("/enviar")
    public ResponseEntity<?> enviarCertificadoAsync(
            @RequestParam("despachanteId") Long despachanteId,
            @RequestParam("motoristaId") Long motoristaId,
            @RequestParam("arquivo") MultipartFile arquivo,
            @RequestParam(value = "observacoes", required = false) String observacoes,
            Authentication authentication) {
        logger.info("Recebida requisição para enviar documento: despachanteId={}, motoristaId={}, arquivo={}, observacoes={}, user={}",
            despachanteId, motoristaId, arquivo != null ? arquivo.getOriginalFilename() : null, observacoes, authentication != null ? authentication.getName() : null);
        // Validações rápidas
        if (arquivo == null || arquivo.isEmpty()) {
            logger.warn("Arquivo não enviado ou está vazio");
            return ResponseEntity.badRequest().body(Map.of("error", "Arquivo é obrigatório"));
        }
        String contentType = arquivo.getContentType();
        if (!List.of("application/pdf", "image/jpeg", "image/png", "image/jpg").contains(contentType)) {
            logger.warn("Tipo de arquivo não é permitido: {}", contentType);
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
        // Processa em background
        this.processarEnvioCertificadoAsync(despachanteId, motoristaId, arquivo, observacoes, authentication.getName());
        logger.info("Processamento do certificado enviado para background. Resposta imediata ao usuário.");
        return ResponseEntity.accepted().body(Map.of("success", true, "message", "Certificado está sendo processado. Você será notificado ao finalizar."));
    }

            @Async
            public void processarEnvioCertificadoAsync(Long despachanteId, Long motoristaId, MultipartFile arquivo, String observacoes, String usuario) {
                logger.info("[Async] Iniciando processamento do certificado para despachanteId={}, motoristaId={}, arquivo={}, user={}",
                    despachanteId, motoristaId, arquivo != null ? arquivo.getOriginalFilename() : null, usuario);
                long start = System.currentTimeMillis();
                try {
                    EnviarCertificadoRequest request = new EnviarCertificadoRequest();
                    request.setDespachanteId(despachanteId);
                    request.setMotoristaId(motoristaId);
                    request.setObservacoes(observacoes);
                    EnvioCertificado resultado = certificadoService.enviarCertificado(request, arquivo, usuario);
                    long end = System.currentTimeMillis();
                    logger.info("[Async] Certificado enviado com sucesso! id={}, tempo={}ms", resultado.getId(), (end - start));
                    // Aqui você pode disparar notificação, e-mail, etc.
                } catch (Exception e) {
                    logger.error("[Async] Erro ao processar envio de certificado: {}", e.getMessage(), e);
                    // Aqui você pode disparar notificação de erro, etc.
                }
            }

        }
