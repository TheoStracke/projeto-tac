package com.validacao.dto;

import jakarta.validation.constraints.NotNull;

import com.validacao.model.Motorista;

public class EnviarCertificadoRequest {
    @NotNull
    private Long despachanteId;
    private Long motoristaId; // pode ser null se for novo
    private Motorista motorista; // dados completos para cadastro
    private String observacoes;

    public Long getDespachanteId() { return despachanteId; }
    public void setDespachanteId(Long despachanteId) { this.despachanteId = despachanteId; }
    public Long getMotoristaId() { return motoristaId; }
    public void setMotoristaId(Long motoristaId) { this.motoristaId = motoristaId; }
    public Motorista getMotorista() { return motorista; }
    public void setMotorista(Motorista motorista) { this.motorista = motorista; }
    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }
}
