package com.validacao.dto;

import com.validacao.model.TipoEmpresa;

public class LoginResponse {
    private String token;
    private Long empresaId;
    private String cnpj;
    private String razaoSocial;
    private String email;
    private TipoEmpresa tipo;
    
    // Construtores
    public LoginResponse() {}
    
    public LoginResponse(String token, Long empresaId, String cnpj, String razaoSocial, String email, TipoEmpresa tipo) {
        this.token = token;
        this.empresaId = empresaId;
        this.cnpj = cnpj;
        this.razaoSocial = razaoSocial;
        this.email = email;
        this.tipo = tipo;
    }
    
    // Getters e Setters
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    
    public Long getEmpresaId() { return empresaId; }
    public void setEmpresaId(Long empresaId) { this.empresaId = empresaId; }
    
    public String getCnpj() { return cnpj; }
    public void setCnpj(String cnpj) { this.cnpj = cnpj; }
    
    public String getRazaoSocial() { return razaoSocial; }
    public void setRazaoSocial(String razaoSocial) { this.razaoSocial = razaoSocial; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public TipoEmpresa getTipo() { return tipo; }
    public void setTipo(TipoEmpresa tipo) { this.tipo = tipo; }
}
