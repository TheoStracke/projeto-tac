package com.validacao.service;

import com.validacao.model.Documento;
import com.validacao.model.StatusDocumento;
import com.validacao.model.Empresa;
import com.validacao.model.TipoEmpresa;
import com.validacao.repository.DocumentoRepository;
import com.validacao.repository.EmpresaRepository;
import com.validacao.repository.MotoristaRepository;
import com.validacao.model.Motorista;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


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
    private MotoristaRepository motoristaRepository;

    private static final Logger logger = LoggerFactory.getLogger(DocumentoService.class);
    
    @Autowired
    private DocumentoRepository documentoRepository;
    
    @Autowired
    private EmpresaRepository empresaRepository;
    
    @Autowired
    private EmailService emailService;
    
    @Value("${app.upload.dir:uploads/}")
    private String UPLOAD_DIR;

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
        
        // Salvar arquivo
        String nomeArquivo = salvarArquivo(arquivo);
        logger.info("[DOC] Arquivo salvo: {}", nomeArquivo);

        // Cadastro automático do motorista
        Motorista motorista = null;
        if (cpf != null && !cpf.isBlank()) {
            motorista = motoristaRepository.findByCpf(cpf).orElse(null);
            if (motorista == null) {
                motorista = new Motorista();
                motorista.setCpf(cpf);
                motorista.setNome(nomeMotorista);
                motorista.setEmail(email);
                motorista.setTelefone(telefone);
                // Tenta converter dataNascimento para LocalDate
                try {
                    if (dataNascimento != null && !dataNascimento.isBlank()) {
                        motorista.setDataNascimento(java.time.LocalDate.parse(dataNascimento));
                    }
                } catch (Exception e) {
                    logger.warn("[MOTORISTA] Data de nascimento inválida: {}", dataNascimento);
                }
                motoristaRepository.save(motorista);
                logger.info("[MOTORISTA] Motorista cadastrado automaticamente: {} - {}", nomeMotorista, cpf);
            }
        }

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
        documento.setCurso(curso);
        logger.info("[SALVANDO DOCUMENTO] curso={}, ufEmissor={}", documento.getCurso(), documento.getUfEmissor());
        documento.setTelefone(telefone);
        documento.setCursoTACCompleto("TAC".equalsIgnoreCase(curso));
        documento.setCursoRTCompleto("RT".equalsIgnoreCase(curso));
        documento.setCurso(curso);
        // Sempre salvar caminho relativo ao diretório do projeto
        documento.setArquivoPath(UPLOAD_DIR + nomeArquivo);
        documento.setNomeArquivoOriginal(arquivo.getOriginalFilename());
        documento.setDataEnvio(LocalDateTime.now(java.time.ZoneId.of("America/Sao_Paulo")));
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
        documento.setDataAprovacao(LocalDateTime.now(java.time.ZoneId.of("America/Sao_Paulo")));
        
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
        documento.setDataAprovacao(LocalDateTime.now(java.time.ZoneId.of("America/Sao_Paulo")));
        
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
            logger.info("[DOC] Salvando arquivo: {}", arquivo.getOriginalFilename());
            // Criar diretório se não existir
            // Garante que o caminho é relativo ao diretório do projeto
            Path uploadPath = Paths.get(UPLOAD_DIR).toAbsolutePath();
            if (!Files.exists(uploadPath)) {
                logger.info("[DOC] Diretório de upload não existe. Criando: {}", uploadPath);
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
            logger.info("[DOC] Arquivo salvo em: {}", arquivoPath);
            return nomeUnico;
        } catch (IOException e) {
            logger.error("[DOC] Erro ao salvar arquivo", e);
            throw new RuntimeException("Erro ao salvar arquivo: " + e.getMessage());
        }
    }
}
