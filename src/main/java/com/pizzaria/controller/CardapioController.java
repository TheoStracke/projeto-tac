package com.pizzaria.controller;

import com.pizzaria.model.Cardapio;
import com.pizzaria.service.CardapioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cardapios")
public class CardapioController {

    @Autowired
    private CardapioService service;

    @GetMapping
    public List<Cardapio> listar() {
        return service.listar();
    }

    @PostMapping
    public Cardapio adicionar(@RequestBody Cardapio cardapio) {
        return service.salvar(cardapio);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        service.deletar(id);
    }
}