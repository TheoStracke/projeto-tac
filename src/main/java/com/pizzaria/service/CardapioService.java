package com.pizzaria.service;

import com.pizzaria.model.Cardapio;
import com.pizzaria.repository.CardapioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CardapioService {

    @Autowired
    private CardapioRepository repository;

    public List<Cardapio> listar() {
        return repository.findAll();
    }

    public Cardapio salvar(Cardapio cardapio) {
        return repository.save(cardapio);
    }

    public void deletar(Long id) {
        repository.deleteById(id);
    }
}