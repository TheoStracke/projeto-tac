package com.pizzaria.service;

import com.pizzaria.model.Ingrediente;
import com.pizzaria.repository.IngredienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class IngredienteService {

    @Autowired
    private IngredienteRepository repository;

    public List<Ingrediente> listar() {
        return repository.findAll();
    }

    public Ingrediente salvar(Ingrediente ingrediente) {
        return repository.save(ingrediente);
    }

    public void deletar(Long id) {
        repository.deleteById(id);
    }
}