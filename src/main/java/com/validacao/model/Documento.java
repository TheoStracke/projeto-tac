package com.validacao.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;

@Entity
public class Documento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String titulo;
    
    private String descricao;
    
    @Column(nullable = false)
    private String arquivoPath; // caminho do arquivo no servidor
    
    @Column(nullable = false)
    private String nomeArquivoOriginal;
    
    @Column(nullable = false)
    private LocalDateTime dataEnvio;
    
    @Enumerated(EnumType.STRING)
    private StatusDocumento status = StatusDocumento.PENDENTE;
    
    @ManyToOne
    @JoinColumn(name = "empresa_remetente_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Empresa empresaRemetente; // Despachante que enviou
    
    private String nomeMotorista;    
    @Column(unique = true)
    private String tokenAprovacao; // token único para link de aprovação
    
    private String comentarios;
    
    private LocalDateTime dataAprovacao;
    
    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    
    public String getArquivoPath() { return arquivoPath; }
    public void setArquivoPath(String arquivoPath) { this.arquivoPath = arquivoPath; }
    
    public String getNomeArquivoOriginal() { return nomeArquivoOriginal; }
    public void setNomeArquivoOriginal(String nomeArquivoOriginal) { this.nomeArquivoOriginal = nomeArquivoOriginal; }
    
    public LocalDateTime getDataEnvio() { return dataEnvio; }
    public void setDataEnvio(LocalDateTime dataEnvio) { this.dataEnvio = dataEnvio; }
    
    public StatusDocumento getStatus() { return status; }
    public void setStatus(StatusDocumento status) { this.status = status; }
    
    public Empresa getEmpresaRemetente() { return empresaRemetente; }
    public void setEmpresaRemetente(Empresa empresaRemetente) { this.empresaRemetente = empresaRemetente; }
    
    public String getNomeMotorista() { return nomeMotorista; }
    public void setNomeMotorista(String nomeMotorista) { this.nomeMotorista = nomeMotorista; }
    
    public String getTokenAprovacao() { return tokenAprovacao; }
    public void setTokenAprovacao(String tokenAprovacao) { this.tokenAprovacao = tokenAprovacao; }
    
    public String getComentarios() { return comentarios; }
    public void setComentarios(String comentarios) { this.comentarios = comentarios; }
    
    public LocalDateTime getDataAprovacao() { return dataAprovacao; }
    public void setDataAprovacao(LocalDateTime dataAprovacao) { this.dataAprovacao = dataAprovacao; }
}
