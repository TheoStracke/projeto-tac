// src/main/java/com/pizzaria/dto/ItemCarrinhoResponseDTO.java
package com.pizzaria.dto;

public class ItemCarrinhoResponseDTO {
    private Long id;
    private Long pizzaId;
    private String pizzaNome;
    private String pizzaDescricao;
    private double pizzaPreco;
    private int quantidade;

    public ItemCarrinhoResponseDTO(Long id,
                                   Long pizzaId,
                                   String pizzaNome,
                                   String pizzaDescricao,
                                   double pizzaPreco,
                                   int quantidade) {
        this.id = id;
        this.pizzaId = pizzaId;
        this.pizzaNome = pizzaNome;
        this.pizzaDescricao = pizzaDescricao;
        this.pizzaPreco = pizzaPreco;
        this.quantidade = quantidade;
    }

    public Long getId() { return id; }
    public Long getPizzaId() { return pizzaId; }
    public String getPizzaNome() { return pizzaNome; }
    public String getPizzaDescricao() { return pizzaDescricao; }
    public double getPizzaPreco() { return pizzaPreco; }
    public int getQuantidade() { return quantidade; }
}
