package com.validacao.service;

import com.validacao.model.Documento;
import com.validacao.model.StatusDocumento;
import com.validacao.model.Empresa;
import com.validacao.model.TipoEmpresa;
import com.validacao.repository.DocumentoRepository;
import com.validacao.repository.EmpresaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class DocumentoService {
    
    @Autowired
    private DocumentoRepository documentoRepository;
    
    @Autowired
    private EmpresaRepository empresaRepository;
    
    @Autowired
    private EmailService emailService;
    
    private final String UPLOAD_DIR = "uploads/";
    
    public Documento enviarDocumento(MultipartFile arquivo, String titulo, String descricao, 
                                   String nomeMotorista, Long empresaRemetenteId) {
        
        // Buscar empresa remetente
        Empresa empresaRemetente = empresaRepository.findById(empresaRemetenteId)
                .orElseThrow(() -> new RuntimeException("Empresa não encontrada"));
        
        // Verificar se é despachante
        if (empresaRemetente.getTipo() != TipoEmpresa.DESPACHANTE) {
            throw new RuntimeException("Apenas despachantes podem enviar documentos");
        }
        
        // Salvar arquivo
        String nomeArquivo = salvarArquivo(arquivo);
        
        // Criar documento
        Documento documento = new Documento();
        documento.setTitulo(titulo);
        documento.setDescricao(descricao);
        documento.setNomeMotorista(nomeMotorista);
        documento.setArquivoPath(UPLOAD_DIR + nomeArquivo);
        documento.setNomeArquivoOriginal(arquivo.getOriginalFilename());
        documento.setDataEnvio(LocalDateTime.now());
        documento.setStatus(StatusDocumento.PENDENTE);
        documento.setEmpresaRemetente(empresaRemetente);
        documento.setTokenAprovacao(UUID.randomUUID().toString());
        
        Documento savedDoc = documentoRepository.save(documento);
        
        // Enviar email para Estrada Fácil
        try {
            List<Empresa> estradaFacilList = empresaRepository.findByTipo(TipoEmpresa.ESTRADA_FACIL);
            for (Empresa estradaFacil : estradaFacilList) {
                emailService.enviarEmailAprovacao(estradaFacil.getEmail(), nomeMotorista, savedDoc.getTokenAprovacao());
            }
        } catch (Exception e) {
            // Email falhou, mas continuamos
        }
        
        return savedDoc;
    }
    
    public Documento aprovarDocumento(String token, boolean aprovado, String comentarios) {
        Documento documento = documentoRepository.findByTokenAprovacao(token)
                .orElseThrow(() -> new RuntimeException("Token de aprovação inválido"));
        
        if (documento.getStatus() != StatusDocumento.PENDENTE) {
            throw new RuntimeException("Este documento já foi processado");
        }
        
        documento.setStatus(aprovado ? StatusDocumento.APROVADO : StatusDocumento.REJEITADO);
        documento.setComentarios(comentarios);
        documento.setDataAprovacao(LocalDateTime.now());
        
        Documento savedDoc = documentoRepository.save(documento);
        
        // Enviar email para o despachante
        try {
            String status = aprovado ? "APROVADO" : "REJEITADO";
            emailService.enviarEmailAprovado(
                documento.getEmpresaRemetente().getEmail(),
                documento.getNomeMotorista(),
                status
            );
        } catch (Exception e) {
            // Email falhou, mas continuamos
        }
        
        return savedDoc;
    }
    
    public List<Documento> listarDocumentosPorEmpresa(Long empresaId) {
        Empresa empresa = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new RuntimeException("Empresa não encontrada"));
        
        return documentoRepository.findByEmpresaRemetenteOrderByDataEnvioDesc(empresa);
    }
    
    public List<Documento> listarDocumentosPendentes() {
        return documentoRepository.findByStatus(StatusDocumento.PENDENTE);
    }
    
    public Documento aprovarDocumentoPorId(Long id, boolean aprovado, String comentarios) {
        Documento documento = documentoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Documento não encontrado"));
        
        if (documento.getStatus() != StatusDocumento.PENDENTE) {
            throw new RuntimeException("Este documento já foi processado");
        }
        
        documento.setStatus(aprovado ? StatusDocumento.APROVADO : StatusDocumento.REJEITADO);
        documento.setComentarios(comentarios);
        documento.setDataAprovacao(LocalDateTime.now());
        
        Documento savedDoc = documentoRepository.save(documento);
        
        // Enviar email para o despachante
        try {
            String status = aprovado ? "APROVADO" : "REJEITADO";
            emailService.enviarEmailAprovado(
                documento.getEmpresaRemetente().getEmail(),
                documento.getNomeMotorista(),
                status
            );
        } catch (Exception e) {
            // Email falhou, mas continuamos
        }
        
        return savedDoc;
    }
    
    public Optional<Documento> buscarPorToken(String token) {
        return documentoRepository.findByTokenAprovacao(token);
    }
    
    public Optional<Documento> buscarPorId(Long id) {
        return documentoRepository.findById(id);
    }
    
    private String salvarArquivo(MultipartFile arquivo) {
        try {
            // Criar diretório se não existir
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            // Gerar nome único para o arquivo
            String nomeOriginal = arquivo.getOriginalFilename();
            if (nomeOriginal == null || nomeOriginal.isEmpty()) {
                nomeOriginal = "documento.pdf";
            }
            String extensao = nomeOriginal.contains(".") ? 
                nomeOriginal.substring(nomeOriginal.lastIndexOf(".")) : ".pdf";
            String nomeUnico = UUID.randomUUID().toString() + extensao;
            
            // Salvar arquivo
            Path arquivoPath = uploadPath.resolve(nomeUnico);
            Files.copy(arquivo.getInputStream(), arquivoPath);
            
            return nomeUnico;
            
        } catch (IOException e) {
            throw new RuntimeException("Erro ao salvar arquivo: " + e.getMessage());
        }
    }
}
