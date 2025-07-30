package com.pizzaria.model;

import jakarta.persistence.*;

@Entity
public class ItemCarrinho {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Carrinho carrinho;

    @ManyToOne
    private Pizza pizza;

    @ManyToOne
    private Cliente cliente;

    private int quantidade;
    private double subtotal;

    // Getters e setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Carrinho getCarrinho() { return carrinho; }
    public void setCarrinho(Carrinho carrinho) { this.carrinho = carrinho; }
    public Pizza getPizza() { return pizza; }
    public void setPizza(Pizza pizza) { this.pizza = pizza; }
    public Cliente getCliente() { return cliente; }
    public void setCliente(Cliente cliente) { this.cliente = cliente; }
    public int getQuantidade() { return quantidade; }
    public void setQuantidade(int quantidade) { this.quantidade = quantidade; }
    public double getSubtotal() { return subtotal; }
    public void setSubtotal(double subtotal) { this.subtotal = subtotal; }
}
