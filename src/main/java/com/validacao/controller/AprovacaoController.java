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
    
    /**
     * Endpoint para aprovação rápida via link do email
     */
    @GetMapping("/{token}/aprovar")
    public ResponseEntity<String> aprovarRapido(@PathVariable String token) {
        try {
            Documento documento = documentoService.aprovarDocumento(token, true, "Aprovado via link do email");
            
            String html = """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Documento Aprovado</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 50px; text-align: center; }
                        .success { color: #28a745; font-size: 24px; margin: 20px 0; }
                        .info { color: #666; margin: 10px 0; }
                        .btn { background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
                    </style>
                </head>
                <body>
                    <h1 class="success">✅ Documento Aprovado com Sucesso!</h1>
                    <div class="info">
                        <p><strong>Motorista:</strong> %s</p>
                        <p><strong>Documento:</strong> %s</p>
                        <p><strong>Status:</strong> APROVADO</p>
                    </div>
                    <p><a href="http://localhost:5173/dashboard" class="btn">Ir para o Dashboard</a></p>
                </body>
                </html>
                """.formatted(documento.getNomeMotorista(), documento.getTitulo());
                
            return ResponseEntity.ok().header("Content-Type", "text/html; charset=UTF-8").body(html);
            
        } catch (Exception e) {
            String errorHtml = """
                <!DOCTYPE html>
                <html>
                <head><meta charset="UTF-8"><title>Erro</title></head>
                <body style="font-family: Arial; text-align: center; margin: 50px;">
                    <h1 style="color: #dc3545;">❌ Erro ao Aprovar Documento</h1>
                    <p>%s</p>
                    <a href="http://localhost:5173/dashboard">Voltar ao Dashboard</a>
                </body>
                </html>
                """.formatted(e.getMessage());
                
            return ResponseEntity.badRequest().header("Content-Type", "text/html; charset=UTF-8").body(errorHtml);
        }
    }
    
    /**
     * Endpoint para rejeição rápida via link do email
     */
    @GetMapping("/{token}/rejeitar")
    public ResponseEntity<String> rejeitarRapido(@PathVariable String token) {
        try {
            Documento documento = documentoService.aprovarDocumento(token, false, "Rejeitado via link do email");
            
            String html = """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Documento Rejeitado</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 50px; text-align: center; }
                        .error { color: #dc3545; font-size: 24px; margin: 20px 0; }
                        .info { color: #666; margin: 10px 0; }
                        .btn { background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
                    </style>
                </head>
                <body>
                    <h1 class="error">❌ Documento Rejeitado</h1>
                    <div class="info">
                        <p><strong>Motorista:</strong> %s</p>
                        <p><strong>Documento:</strong> %s</p>
                        <p><strong>Status:</strong> REJEITADO</p>
                    </div>
                    <p><a href="http://localhost:5173/dashboard" class="btn">Ir para o Dashboard</a></p>
                </body>
                </html>
                """.formatted(documento.getNomeMotorista(), documento.getTitulo());
                
            return ResponseEntity.ok().header("Content-Type", "text/html; charset=UTF-8").body(html);
            
        } catch (Exception e) {
            String errorHtml = """
                <!DOCTYPE html>
                <html>
                <head><meta charset="UTF-8"><title>Erro</title></head>
                <body style="font-family: Arial; text-align: center; margin: 50px;">
                    <h1 style="color: #dc3545;">❌ Erro ao Rejeitar Documento</h1>
                    <p>%s</p>
                    <a href="http://localhost:5173/dashboard">Voltar ao Dashboard</a>
                </body>
                </html>
                """.formatted(e.getMessage());
                
            return ResponseEntity.badRequest().header("Content-Type", "text/html; charset=UTF-8").body(errorHtml);
        }
    }
    
    /**
     * Endpoint para visualizar arquivo via token (acesso público via email)
     */
    @GetMapping("/{token}/arquivo")
    public ResponseEntity<org.springframework.core.io.Resource> visualizarArquivoViaToken(@PathVariable String token) {
        try {
            java.util.Optional<com.validacao.model.Documento> documentoOpt = documentoService.buscarPorToken(token);
            if (!documentoOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            com.validacao.model.Documento documento = documentoOpt.get();
            java.nio.file.Path arquivoPath = java.nio.file.Paths.get(documento.getArquivoPath());
            org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(arquivoPath.toUri());
            
            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }
            
            // Determinar o tipo de mídia baseado na extensão
            String nomeArquivo = documento.getNomeArquivoOriginal();
            String contentType = determinarTipoMidia(nomeArquivo);
            
            return ResponseEntity.ok()
                    .contentType(org.springframework.http.MediaType.parseMediaType(contentType))
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + nomeArquivo + "\"")
                    .body(resource);
                    
        } catch (java.net.MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            System.err.println("Erro ao servir arquivo via token: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Determina o tipo de mídia com base na extensão do arquivo
     */
    private String determinarTipoMidia(String nomeArquivo) {
        if (nomeArquivo == null) return "application/octet-stream";
        
        String extensao = nomeArquivo.toLowerCase();
        if (extensao.endsWith(".pdf")) return "application/pdf";
        if (extensao.endsWith(".jpg") || extensao.endsWith(".jpeg")) return "image/jpeg";
        if (extensao.endsWith(".png")) return "image/png";
        if (extensao.endsWith(".doc")) return "application/msword";
        if (extensao.endsWith(".docx")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        
        return "application/octet-stream";
    }
}
