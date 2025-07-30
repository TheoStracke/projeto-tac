package com.pizzaria.service;

import com.pizzaria.model.Pizza;
import com.pizzaria.repository.PizzaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PizzaService {
    @Autowired
    private PizzaRepository repo;

    public List<Pizza> listar() {
        return repo.findAll();
    }

    public Optional<Pizza> buscar(Long id) {
        return repo.findById(id);
    }

    public Pizza salvar(Pizza pizza) {
        return repo.save(pizza);
    }

    public void deletar(Long id) {
        repo.deleteById(id);
    }
}
