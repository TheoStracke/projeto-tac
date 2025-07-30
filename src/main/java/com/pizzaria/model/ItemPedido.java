package com.pizzaria.model;

import jakarta.persistence.*;

@Entity
public class ItemPedido {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long pizzaId;
    private String nomePizza;
    private int quantidade;
    private double precoUnitario;

    @ManyToOne
    private Pedido pedido;

    // Getters e setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getPizzaId() { return pizzaId; }
    public void setPizzaId(Long pizzaId) { this.pizzaId = pizzaId; }
    public String getNomePizza() { return nomePizza; }
    public void setNomePizza(String nomePizza) { this.nomePizza = nomePizza; }
    public int getQuantidade() { return quantidade; }
    public void setQuantidade(int quantidade) { this.quantidade = quantidade; }
    public double getPrecoUnitario() { return precoUnitario; }
    public void setPrecoUnitario(double precoUnitario) { this.precoUnitario = precoUnitario; }
    public Pedido getPedido() { return pedido; }
    public void setPedido(Pedido pedido) { this.pedido = pedido; }
}
