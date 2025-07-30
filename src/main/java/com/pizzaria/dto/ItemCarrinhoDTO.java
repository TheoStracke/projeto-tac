package com.pizzaria.dto;

import com.pizzaria.model.ItemCarrinho;

public class ItemCarrinhoDTO {
    private Long id;
    private String nomePizza;
    private Double precoUnitario;
    private Integer quantidade;
    private Double subtotal;

    public ItemCarrinhoDTO() {}

    public ItemCarrinhoDTO(ItemCarrinho item) {
        this.id = item.getId();
        this.nomePizza = item.getPizza() != null ? item.getPizza().getNome() : null;
        this.precoUnitario = item.getPizza() != null ? item.getPizza().getPreco() : null;
        this.quantidade = item.getQuantidade();
        this.subtotal = item.getSubtotal();
    }

    // Getters e setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNomePizza() { return nomePizza; }
    public void setNomePizza(String nomePizza) { this.nomePizza = nomePizza; }
    public Double getPrecoUnitario() { return precoUnitario; }
    public void setPrecoUnitario(Double precoUnitario) { this.precoUnitario = precoUnitario; }
    public Integer getQuantidade() { return quantidade; }
    public void setQuantidade(Integer quantidade) { this.quantidade = quantidade; }
    public Double getSubtotal() { return subtotal; }
    public void setSubtotal(Double subtotal) { this.subtotal = subtotal; }
}
