package com.validacao.controller;

import com.validacao.model.Documento;
import com.validacao.service.DocumentoService;
import com.validacao.service.S3Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/documentos")
public class DocumentoController {
    private static final Logger logger = LoggerFactory.getLogger(DocumentoController.class);
    

    @Autowired
    private DocumentoService documentoService;
    @Autowired
    private S3Service s3Service;
    
    @PostMapping("/enviar")
    public ResponseEntity<?> enviarDocumento(
            @RequestParam("arquivo") MultipartFile arquivo,
            @RequestParam("titulo") String titulo,
            @RequestParam("descricao") String descricao,
            @RequestParam("nomeMotorista") String nomeMotorista,
            @RequestParam("cpf") String cpf,
            @RequestParam("dataNascimento") String dataNascimento,
            @RequestParam("sexo") String sexo,
            @RequestParam("email") String email,
            @RequestParam("identidade") String identidade,
            @RequestParam("orgaoEmissor") String orgaoEmissor,
            @RequestParam("ufEmissor") String ufEmissor,
            @RequestParam("telefone") String telefone,
            @RequestParam("curso") String curso,
            @RequestParam("empresaId") Long empresaId) {
        logger.info("[UPLOAD] Recebendo upload: empresaId={}, titulo={}, nomeMotorista={}, nomeArquivo={}", empresaId, titulo, nomeMotorista, arquivo != null ? arquivo.getOriginalFilename() : "null");
        try {
            if (arquivo == null || arquivo.isEmpty()) {
                logger.warn("[UPLOAD] Arquivo não enviado ou vazio");
                return ResponseEntity.badRequest().body("Arquivo é obrigatório");
            }

            Documento documento = documentoService.enviarDocumento(
                arquivo, titulo, descricao, nomeMotorista,
                cpf, dataNascimento, sexo, email, identidade, orgaoEmissor, ufEmissor, telefone,
                curso, empresaId
            );

            logger.info("[UPLOAD] Documento salvo com sucesso: id={}", documento.getId());
            return ResponseEntity.ok(documento);

        } catch (Exception e) {
            logger.error("[UPLOAD] Erro ao enviar documento", e);
            return ResponseEntity.status(500).body("Erro ao enviar documento: " + e.getMessage());
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
            logger.info("[BUSCAR DOC] Buscando documento ID: {}", id);
            Optional<Documento> documento = documentoService.buscarPorId(id);
            if (documento.isPresent()) {
                logger.info("[BUSCAR DOC] Documento encontrado: {}, arquivo: {}", 
                    documento.get().getId(), documento.get().getArquivoPath());
                return ResponseEntity.ok(documento.get());
            } else {
                logger.warn("[BUSCAR DOC] Documento não encontrado: {}", id);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("[BUSCAR DOC] Erro ao buscar documento: {}", id, e);
            return ResponseEntity.badRequest().body("Erro ao buscar documento: " + e.getMessage());
        }
    }
    
    /**
     * Endpoint para download/visualização de arquivos
     */
    @GetMapping("/{id}/arquivo")
    public ResponseEntity<?> visualizarArquivo(@PathVariable Long id) {
        try {
            logger.info("[ARQUIVO] Tentando buscar arquivo para documento ID: {}", id);
            Optional<Documento> documentoOpt = documentoService.buscarPorId(id);
            if (!documentoOpt.isPresent()) {
                logger.warn("[ARQUIVO] Documento não encontrado: {}", id);
                return ResponseEntity.notFound().build();
            }
            Documento documento = documentoOpt.get();
            if (documento.getArquivoPath() == null || documento.getArquivoPath().isEmpty()) {
                logger.warn("[ARQUIVO] Documento não possui arquivo associado: {}", id);
                return ResponseEntity.notFound().build();
            }
            String s3Key = documento.getArquivoPath();
            String nomeArquivo = documento.getNomeArquivoOriginal();
            // Gerar URL temporária do S3
            java.net.URL presignedUrl = s3Service.generatePresignedUrl(s3Key);
            logger.info("[ARQUIVO] URL temporária gerada para arquivo: {} -> {}", nomeArquivo, presignedUrl);
            return ResponseEntity.ok().body(presignedUrl.toString());
        } catch (Exception e) {
            logger.error("[ARQUIVO] Erro ao gerar URL temporária para arquivo", e);
            return ResponseEntity.internalServerError().body("Erro ao gerar URL temporária para arquivo: " + e.getMessage());
        }
    }
    
}
