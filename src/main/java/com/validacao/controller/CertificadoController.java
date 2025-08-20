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

@RestController
@RequestMapping("/api/certificados")
public class CertificadoController {
    @Autowired
    private CertificadoService certificadoService;

    @PostMapping("/enviar")
    public ResponseEntity<?> enviarCertificado(
            @RequestParam("despachanteId") Long despachanteId,
            @RequestParam("motoristaId") Long motoristaId,
            @RequestParam("arquivo") MultipartFile arquivo,
            @RequestParam(value = "observacoes", required = false) String observacoes,
            Authentication authentication) {
        try {
            if (arquivo.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Arquivo é obrigatório"));
            }
            String contentType = arquivo.getContentType();
            if (!List.of("application/pdf", "image/jpeg", "image/png", "image/jpg").contains(contentType)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Tipo de arquivo não permitido"));
            }
            if (arquivo.getSize() > 10 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(Map.of("error", "Arquivo muito grande. Máximo: 10MB"));
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
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
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
