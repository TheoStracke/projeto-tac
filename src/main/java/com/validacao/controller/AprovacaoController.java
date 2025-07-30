package com.validacao.controller;

import com.validacao.model.Documento;
import com.validacao.service.DocumentoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/aprovacao")
@CrossOrigin(origins = "*")
public class AprovacaoController {
    
    @Autowired
    private DocumentoService documentoService;
    
    @GetMapping("/{token}")
    public ResponseEntity<?> buscarDocumentoPorToken(@PathVariable String token) {
        Optional<Documento> documento = documentoService.buscarPorToken(token);
        
        if (documento.isPresent()) {
            return ResponseEntity.ok(documento.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping("/{token}")
    public ResponseEntity<?> processarAprovacao(
            @PathVariable String token,
            @RequestBody Map<String, Object> dadosAprovacao) {
        
        try {
            Boolean aprovado = (Boolean) dadosAprovacao.get("aprovado");
            String comentarios = (String) dadosAprovacao.get("comentarios");
            
            if (aprovado == null) {
                return ResponseEntity.badRequest().body("Campo 'aprovado' é obrigatório");
            }
            
            Documento documento = documentoService.aprovarDocumento(
                token, aprovado, comentarios != null ? comentarios : ""
            );
            
            return ResponseEntity.ok(documento);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao processar aprovação: " + e.getMessage());
        }
    }
}
