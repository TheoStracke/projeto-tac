package com.validacao.controller;

import com.validacao.model.Documento;
import com.validacao.service.DocumentoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/documentos")
@CrossOrigin(origins = "*")
public class DocumentoController {
    
    @Autowired
    private DocumentoService documentoService;
    
    @PostMapping("/enviar")
    public ResponseEntity<?> enviarDocumento(
            @RequestParam("arquivo") MultipartFile arquivo,
            @RequestParam("titulo") String titulo,
            @RequestParam("descricao") String descricao,
            @RequestParam("nomeMotorista") String nomeMotorista,
            @RequestParam("empresaId") Long empresaId) {
        
        System.out.println("=== RECEBENDO DOCUMENTO ===");
        System.out.println("Título: " + titulo);
        System.out.println("Empresa ID: " + empresaId);
        System.out.println("Arquivo: " + (arquivo != null ? arquivo.getOriginalFilename() : "null"));
        
        try {
            if (arquivo == null || arquivo.isEmpty()) {
                return ResponseEntity.badRequest().body("Arquivo é obrigatório");
            }
            
            Documento documento = documentoService.enviarDocumento(
                arquivo, titulo, descricao, nomeMotorista, empresaId
            );
            
            System.out.println("Documento criado com ID: " + documento.getId());
            return ResponseEntity.ok(documento);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao enviar documento: " + e.getMessage());
        }
    }
    
    @GetMapping("/empresa/{empresaId}")
    public ResponseEntity<List<Documento>> listarDocumentosPorEmpresa(@PathVariable Long empresaId) {
        try {
            List<Documento> documentos = documentoService.listarDocumentosPorEmpresa(empresaId);
            return ResponseEntity.ok(documentos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/pendentes")
    public ResponseEntity<List<Documento>> listarDocumentosPendentes() {
        List<Documento> documentos = documentoService.listarDocumentosPendentes();
        return ResponseEntity.ok(documentos);
    }
}
