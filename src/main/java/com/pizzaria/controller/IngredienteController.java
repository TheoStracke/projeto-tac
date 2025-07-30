package com.pizzaria.controller;

import com.pizzaria.model.Ingrediente;
import com.pizzaria.service.IngredienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ingredientes")
public class IngredienteController {

    @Autowired
    private IngredienteService service;

    @GetMapping
    public List<Ingrediente> listar() {
        return service.listar();
    }

    @PostMapping
    public Ingrediente adicionar(@RequestBody Ingrediente ingrediente) {
        return service.salvar(ingrediente);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        service.deletar(id);
    }
}