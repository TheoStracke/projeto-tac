package com.validacao.controller;

import com.validacao.model.Documento;
import com.validacao.service.DocumentoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

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
        
        try {
            if (arquivo == null || arquivo.isEmpty()) {
                return ResponseEntity.badRequest().body("Arquivo é obrigatório");
            }
            
            Documento documento = documentoService.enviarDocumento(
                arquivo, titulo, descricao, nomeMotorista, empresaId
            );
            
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
    
    @PostMapping("/{id}/aprovar")
    public ResponseEntity<?> aprovarDocumento(@PathVariable Long id, @RequestBody(required = false) String comentarios) {
        try {
            Documento documento = documentoService.aprovarDocumentoPorId(id, true, comentarios);
            
            return ResponseEntity.ok(documento);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao aprovar documento: " + e.getMessage());
        }
    }
    
    @PostMapping("/{id}/rejeitar")
    public ResponseEntity<?> rejeitarDocumento(@PathVariable Long id, @RequestBody(required = false) String comentarios) {
        try {
            Documento documento = documentoService.aprovarDocumentoPorId(id, false, comentarios);
            
            return ResponseEntity.ok(documento);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao rejeitar documento: " + e.getMessage());
        }
    }
    
    /**
     * Endpoint para buscar detalhes de um documento específico
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> buscarDocumento(@PathVariable Long id) {
        try {
            Optional<Documento> documento = documentoService.buscarPorId(id);
            if (documento.isPresent()) {
                return ResponseEntity.ok(documento.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao buscar documento: " + e.getMessage());
        }
    }
    
    /**
     * Endpoint para download/visualização de arquivos
     */
    @GetMapping("/{id}/arquivo")
    public ResponseEntity<Resource> visualizarArquivo(@PathVariable Long id) {
        try {
            Optional<Documento> documentoOpt = documentoService.buscarPorId(id);
            if (!documentoOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            Documento documento = documentoOpt.get();
            Path arquivoPath = Paths.get(documento.getArquivoPath());
            Resource resource = new UrlResource(arquivoPath.toUri());
            
            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }
            
            // Determinar o tipo de mídia baseado na extensão
            String nomeArquivo = documento.getNomeArquivoOriginal();
            String contentType = determinarTipoMidia(nomeArquivo);
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + nomeArquivo + "\"")
                    .body(resource);
                    
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
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
