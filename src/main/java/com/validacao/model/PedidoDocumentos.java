package com.validacao.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
public class PedidoDocumentos {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "empresa_remetente_id")
    private Empresa empresaRemetente;

    private String nomeMotorista;
    private String cpf;
    private String dataNascimento;
    private String sexo;
    private String email;
    private String identidade;
    private String orgaoEmissor;
    private String ufEmissor;
    private String telefone;
    private String curso;
    private String titulo;
    private String descricao;
    private LocalDateTime dataEnvio;
    private String status; // PENDENTE, APROVADO, REJEITADO
    private String comentarios;
    private LocalDateTime dataAprovacao;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL)
    private List<Documento> documentos;

    // Getters e setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Empresa getEmpresaRemetente() { return empresaRemetente; }
    public void setEmpresaRemetente(Empresa empresaRemetente) { this.empresaRemetente = empresaRemetente; }
    public String getNomeMotorista() { return nomeMotorista; }
    public void setNomeMotorista(String nomeMotorista) { this.nomeMotorista = nomeMotorista; }
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
    public String getCurso() { return curso; }
    public void setCurso(String curso) { this.curso = curso; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public LocalDateTime getDataEnvio() { return dataEnvio; }
    public void setDataEnvio(LocalDateTime dataEnvio) { this.dataEnvio = dataEnvio; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getComentarios() { return comentarios; }
    public void setComentarios(String comentarios) { this.comentarios = comentarios; }
    public LocalDateTime getDataAprovacao() { return dataAprovacao; }
    public void setDataAprovacao(LocalDateTime dataAprovacao) { this.dataAprovacao = dataAprovacao; }
    public List<Documento> getDocumentos() { return documentos; }
    public void setDocumentos(List<Documento> documentos) { this.documentos = documentos; }
}
