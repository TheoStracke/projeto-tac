package com.validacao.service;

import com.validacao.dto.EnviarCertificadoRequest;
import com.validacao.model.Empresa;
import com.validacao.model.EnvioCertificado;
import com.validacao.model.Motorista;
import com.validacao.model.EnvioCertificado.StatusEnvio;
import com.validacao.repository.EmpresaRepository;
import com.validacao.repository.EnvioCertificadoRepository;
import com.validacao.repository.MotoristaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class CertificadoService {
    @Autowired
    private EnvioCertificadoRepository envioCertificadoRepository;
    @Autowired
    private EmpresaRepository empresaRepository;
    @Autowired
    private MotoristaRepository motoristaRepository;
    @Autowired
    private EmailService emailService;
    @Autowired
    private FileStorageService fileStorageService;

    public EnvioCertificado enviarCertificado(EnviarCertificadoRequest request, MultipartFile arquivo, String enviadoPor) {
        Empresa despachante = empresaRepository.findById(request.getDespachanteId())
                .orElseThrow(() -> new RuntimeException("Despachante não encontrado"));
        Motorista motorista = motoristaRepository.findById(request.getMotoristaId())
                .orElseThrow(() -> new RuntimeException("Motorista não encontrado"));
        String caminhoArquivo = fileStorageService.salvarArquivo(arquivo, "certificados");
        EnvioCertificado envio = new EnvioCertificado();
        envio.setDespachante(despachante);
        envio.setMotorista(motorista);
        envio.setNomeArquivoOriginal(arquivo.getOriginalFilename());
        envio.setCaminhoArquivo(caminhoArquivo);
        envio.setTipoArquivo(arquivo.getContentType());
        envio.setTamanhoArquivo(arquivo.getSize());
        envio.setObservacoes(request.getObservacoes());
        envio.setDataEnvio(LocalDateTime.now());
        envio.setEnviadoPor(enviadoPor);
        envio.setStatus(StatusEnvio.PENDENTE);
        envio = envioCertificadoRepository.save(envio);
        try {
            emailService.enviarCertificado(despachante, motorista, arquivo, request.getObservacoes());
            envio.setStatus(StatusEnvio.ENVIADO);
        } catch (Exception e) {
            envio.setStatus(StatusEnvio.ERRO);
            throw new RuntimeException("Erro ao enviar e-mail: " + e.getMessage());
        } finally {
            envioCertificadoRepository.save(envio);
        }
        return envio;
    }

    public List<EnvioCertificado> buscarHistorico(Long despachanteId, Long motoristaId) {
        if (despachanteId != null) {
            return envioCertificadoRepository.findByDespachanteIdOrderByDataEnvioDesc(despachanteId);
        } else if (motoristaId != null) {
            return envioCertificadoRepository.findByMotoristaIdOrderByDataEnvioDesc(motoristaId);
        } else {
            return envioCertificadoRepository.findAll();
        }
    }
}
