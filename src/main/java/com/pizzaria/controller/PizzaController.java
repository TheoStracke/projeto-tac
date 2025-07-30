package com.pizzaria.controller;

import com.pizzaria.dto.PizzaDTO;
import com.pizzaria.model.Pizza;
import com.pizzaria.service.PizzaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/pizzas")
public class PizzaController {

    @Autowired
    private PizzaService service;

    @GetMapping
    public List<PizzaDTO> listar() {
        return service.listar().stream()
            .map(p -> new PizzaDTO(p.getId(), p.getNome(), p.getDescricao(), p.getPreco()))
            .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PizzaDTO> detalhar(@PathVariable Long id) {
        return service.buscar(id)
            .map(p -> ResponseEntity.ok(new PizzaDTO(p.getId(), p.getNome(), p.getDescricao(), p.getPreco())))
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public PizzaDTO criar(@RequestBody PizzaDTO pizzaDTO) {
        Pizza pizza = new Pizza();
        pizza.setNome(pizzaDTO.nome());
        pizza.setDescricao(pizzaDTO.descricao());
        pizza.setPreco(pizzaDTO.preco());
        Pizza saved = service.salvar(pizza);
        return new PizzaDTO(saved.getId(), saved.getNome(), saved.getDescricao(), saved.getPreco());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Pizza> atualizar(@PathVariable Long id, @RequestBody Pizza nova) {
        return service.buscar(id).map(p -> {
            p.setNome(nova.getNome());
            p.setDescricao(nova.getDescricao());
            p.setPreco(nova.getPreco());
            p.setIngredientes(nova.getIngredientes());
            return ResponseEntity.ok(service.salvar(p));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        service.deletar(id);
    }
}
