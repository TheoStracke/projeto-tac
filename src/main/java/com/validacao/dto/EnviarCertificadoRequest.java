package com.validacao.dto;

import jakarta.validation.constraints.NotNull;

public class EnviarCertificadoRequest {
    @NotNull
    private Long despachanteId;
    @NotNull
    private Long motoristaId;
    private String observacoes;

    public Long getDespachanteId() { return despachanteId; }
    public void setDespachanteId(Long despachanteId) { this.despachanteId = despachanteId; }
    public Long getMotoristaId() { return motoristaId; }
    public void setMotoristaId(Long motoristaId) { this.motoristaId = motoristaId; }
    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }
}
