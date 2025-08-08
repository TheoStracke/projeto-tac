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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class DocumentoService {

    private static final Logger logger = LoggerFactory.getLogger(DocumentoService.class);
    
    @Autowired
    private DocumentoRepository documentoRepository;
    
    @Autowired
    private EmpresaRepository empresaRepository;
    
    @Autowired
    private EmailService emailService;
    

    @Autowired
    private S3Service s3Service;

    public Documento enviarDocumento(MultipartFile arquivo, String titulo, String descricao, 
                                   String nomeMotorista,
                                   String cpf, String dataNascimento, String sexo, String email, String identidade, String orgaoEmissor, String ufEmissor, String telefone,
                                   String curso,
                                   Long empresaRemetenteId) {
        
        // Buscar empresa remetente
        logger.info("[DOC] Iniciando envio de documento: empresaId={}, titulo={}, nomeMotorista={}", empresaRemetenteId, titulo, nomeMotorista);
        Empresa empresaRemetente = empresaRepository.findById(empresaRemetenteId)
                .orElseThrow(() -> new RuntimeException("Empresa não encontrada"));
        
        // Verificar se é despachante
        if (empresaRemetente.getTipo() != TipoEmpresa.DESPACHANTE) {
            logger.warn("[DOC] Empresa {} não é despachante!", empresaRemetenteId);
            throw new RuntimeException("Apenas despachantes podem enviar documentos");
        }
        

        // Salvar arquivo no S3
        String s3Key = s3Service.uploadFile(arquivo);
        logger.info("[DOC] Arquivo salvo no S3: {}", s3Key);
        
        // Criar documento
        Documento documento = new Documento();
        documento.setTitulo(titulo);
        documento.setDescricao(descricao);
        documento.setNomeMotorista(nomeMotorista);
        documento.setCpf(cpf);
        documento.setDataNascimento(dataNascimento);
        documento.setSexo(sexo);
        documento.setEmail(email);
        documento.setIdentidade(identidade);
        documento.setOrgaoEmissor(orgaoEmissor);
        documento.setUfEmissor(ufEmissor);
        documento.setTelefone(telefone);
        documento.setCursoTACCompleto("TAC".equalsIgnoreCase(curso));
        documento.setCursoRTCompleto("RT".equalsIgnoreCase(curso));
        documento.setArquivoPath(s3Key); // salva a key do S3
        documento.setNomeArquivoOriginal(arquivo.getOriginalFilename());
        documento.setDataEnvio(LocalDateTime.now());
        documento.setStatus(StatusDocumento.PENDENTE);
        documento.setEmpresaRemetente(empresaRemetente);
        documento.setTokenAprovacao(UUID.randomUUID().toString());
        
        Documento savedDoc = documentoRepository.save(documento);
        logger.info("[DOC] Documento salvo no banco: id={}", savedDoc.getId());
        
        // Enviar email para Estrada Fácil
        try {
            List<Empresa> estradaFacilList = empresaRepository.findByTipo(TipoEmpresa.ESTRADA_FACIL);
            for (Empresa estradaFacil : estradaFacilList) {
                emailService.enviarEmailAprovacao(estradaFacil.getEmail(), nomeMotorista, savedDoc.getTokenAprovacao());
            }
        } catch (Exception e) {
            logger.error("[DOC] Falha ao enviar email de aprovação", e);
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
    
    // Removido salvarArquivo, agora tudo é feito via S3Service
}
