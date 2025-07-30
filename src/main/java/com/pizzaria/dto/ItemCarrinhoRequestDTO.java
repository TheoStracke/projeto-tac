// src/main/java/com/pizzaria/dto/ItemCarrinhoRequestDTO.java
package com.pizzaria.dto;

public class ItemCarrinhoRequestDTO {
    private Long clienteId;
    private Long pizzaId;
    private int quantidade;

    public Long getClienteId() { return clienteId; }
    public void setClienteId(Long clienteId) { this.clienteId = clienteId; }

    public Long getPizzaId() { return pizzaId; }
    public void setPizzaId(Long pizzaId) { this.pizzaId = pizzaId; }

    public int getQuantidade() { return quantidade; }
    public void setQuantidade(int quantidade) { this.quantidade = quantidade; }
}
