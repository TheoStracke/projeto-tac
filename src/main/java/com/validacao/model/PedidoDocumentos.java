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
    @com.fasterxml.jackson.annotation.JsonProperty("curso")
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
    public String getCpf() { 
        return formatarCpf(cpf); 
    }
    public void setCpf(String cpf) { 
        this.cpf = limparCpf(cpf); 
    }
    
    // Método para formatar CPF com máscara (xxx.xxx.xxx-xx)
    private String formatarCpf(String cpf) {
        if (cpf == null || cpf.length() != 11) {
            return cpf; // Retorna sem formatação se não tiver 11 dígitos
        }
        return cpf.substring(0, 3) + "." + 
               cpf.substring(3, 6) + "." + 
               cpf.substring(6, 9) + "-" + 
               cpf.substring(9, 11);
    }
    
    // Método para limpar CPF (remove pontos e traços para salvar no banco)
    private String limparCpf(String cpf) {
        if (cpf == null) return null;
        return cpf.replaceAll("[^0-9]", ""); // Remove tudo que não for número
    }
    
    // Método para validar CPF
    public boolean isValidCpf() {
        String cpfLimpo = limparCpf(this.cpf);
        return validarCpf(cpfLimpo);
    }
    
    private boolean validarCpf(String cpf) {
        if (cpf == null || cpf.length() != 11) return false;
        
        // Verifica se todos os dígitos são iguais
        if (cpf.matches("(\\d)\\1{10}")) return false;
        
        try {
            // Calcula primeiro dígito verificador
            int soma = 0;
            for (int i = 0; i < 9; i++) {
                soma += Character.getNumericValue(cpf.charAt(i)) * (10 - i);
            }
            int digito1 = 11 - (soma % 11);
            if (digito1 > 9) digito1 = 0;
            
            // Calcula segundo dígito verificador
            soma = 0;
            for (int i = 0; i < 10; i++) {
                soma += Character.getNumericValue(cpf.charAt(i)) * (11 - i);
            }
            int digito2 = 11 - (soma % 11);
            if (digito2 > 9) digito2 = 0;
            
            // Verifica se os dígitos calculados são iguais aos do CPF
            return Character.getNumericValue(cpf.charAt(9)) == digito1 && 
                   Character.getNumericValue(cpf.charAt(10)) == digito2;
        } catch (Exception e) {
            return false;
        }
    }
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
    @com.fasterxml.jackson.annotation.JsonProperty("curso")
    public String getCurso() {
        return (curso == null || curso.isEmpty()) ? "Não informado" : curso;
    }
    @com.fasterxml.jackson.annotation.JsonProperty("curso")
    public void setCurso(String curso) {
        this.curso = (curso == null || curso.isEmpty()) ? "Não informado" : curso;
    }
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
