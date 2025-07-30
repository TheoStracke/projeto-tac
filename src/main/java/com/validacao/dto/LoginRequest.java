package com.validacao.dto;

public class LoginRequest {
    private String cnpj;
    private String senha;

    public String getCnpj() {
        return cnpj;
    }

    public void setCnpj(String cnpj) {
        this.cnpj = cnpj;
    }

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }
    
    @Override
    public String toString() {
        return "LoginRequest{cnpj='" + cnpj + "', senha='" + (senha != null ? "[HIDDEN]" : "null") + "'}";
    }
}

