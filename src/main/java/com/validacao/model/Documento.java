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

    // Novos campos para painel de despachante
    private String curso; // "TAC" ou "RT"
    private String cpf;
    private String dataNascimento;
    private String sexo;
    private String email;
    private String identidade;
    private String orgaoEmissor;
    private String ufEmissor;
    private String telefone;
    
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
    // Getters e Setters para novos campos
    public String getCurso() { return curso; }
    public void setCurso(String curso) { this.curso = curso; }
    public String getCpf() { return cpf; }
    public void setCpf(String cpf) { this.cpf = cpf; }
    public String getDataNascimento() { return dataNascimento; }
    public void setDataNascimento(String dataNascimento) { this.dataNascimento = dataNascimento; }
    public String getSexo() { return sexo; }
    public void setSexo(String sexo) { this.sexo = sexo; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getIdentidade() { return identidade; }
    public void setIdentidade(String identidade) { this.identidade = identidade; }
    public String getOrgaoEmissor() { return orgaoEmissor; }
    public void setOrgaoEmissor(String orgaoEmissor) { this.orgaoEmissor = orgaoEmissor; }
    public String getUfEmissor() { return ufEmissor; }
    public void setUfEmissor(String ufEmissor) { this.ufEmissor = ufEmissor; }
    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }
}
