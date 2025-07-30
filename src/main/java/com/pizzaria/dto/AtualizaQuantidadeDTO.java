// src/main/java/com/pizzaria/dto/AtualizaQuantidadeDTO.java
package com.pizzaria.dto;

public class AtualizaQuantidadeDTO {
    private Long itemCarrinhoId;
    private int quantidade;

    public Long getItemCarrinhoId() { return itemCarrinhoId; }
    public void setItemCarrinhoId(Long itemCarrinhoId) { this.itemCarrinhoId = itemCarrinhoId; }

    public int getQuantidade() { return quantidade; }
    public void setQuantidade(int quantidade) { this.quantidade = quantidade; }
}
