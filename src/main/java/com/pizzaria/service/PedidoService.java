package com.pizzaria.service;

import com.pizzaria.model.Pedido;
import com.pizzaria.model.StatusPedido;
import com.pizzaria.repository.PedidoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PedidoService {
    @Autowired
    private PedidoRepository repo;

    public Pedido criar(Pedido pedido) {
        pedido.setData(LocalDateTime.now());
        pedido.setStatus(StatusPedido.PENDENTE);
        return repo.save(pedido);
    }

    public Optional<Pedido> buscar(Long id) { return repo.findById(id); }
    public List<Pedido> historico(Long usuarioId) { return repo.findByUsuarioId(usuarioId); }
}