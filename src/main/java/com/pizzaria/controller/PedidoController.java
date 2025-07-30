package com.pizzaria.controller;

import com.pizzaria.model.Pedido;
import com.pizzaria.service.PedidoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.pizzaria.model.Carrinho;
import com.pizzaria.model.ItemCarrinho;
import com.pizzaria.model.ItemPedido;
import com.pizzaria.model.StatusPedido;
import com.pizzaria.repository.CarrinhoRepository;
import com.pizzaria.repository.ItemCarrinhoRepository;
import java.time.LocalDateTime;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/pedidos")
public class PedidoController {
    @Autowired
    private PedidoService service;
    @Autowired
    private CarrinhoRepository carrinhoRepository;
    @Autowired
    private ItemCarrinhoRepository itemCarrinhoRepository;

    @PostMapping
    public Pedido criar(@RequestBody Pedido pedido) {
        return service.criar(pedido);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pedido> detalhar(@PathVariable Long id) {
        return service.buscar(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/usuarios/{id}/pedidos")
    public List<Pedido> historico(@PathVariable Long id) {
        return service.historico(id);
    }

    // Endpoint para finalizar pedido a partir do carrinho do cliente
    @PostMapping("/finalizar")
    public ResponseEntity<Pedido> finalizarPedido(@RequestParam Long clienteId) {
        // Busca o carrinho do cliente
        Carrinho carrinho = carrinhoRepository.findAll().stream()
            .filter(c -> c.getCliente() != null && c.getCliente().getId().equals(clienteId))
            .findFirst().orElse(null);
        if (carrinho == null || carrinho.getItens() == null || carrinho.getItens().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        Pedido pedido = new Pedido();
        pedido.setData(LocalDateTime.now());
        pedido.setStatus(StatusPedido.PENDENTE);
        pedido.setUsuario(null); // Ajuste se necessário para associar usuário
        pedido.setTotal(carrinho.getItens().stream().mapToDouble(ItemCarrinho::getSubtotal).sum());
        pedido.setItens(
            carrinho.getItens().stream().map(ic -> {
                ItemPedido ip = new ItemPedido();
                ip.setPizzaId(ic.getPizza().getId());
                ip.setNomePizza(ic.getPizza().getNome());
                ip.setQuantidade(ic.getQuantidade());
                ip.setPrecoUnitario(ic.getPizza().getPreco());
                ip.setPedido(pedido);
                return ip;
            }).collect(Collectors.toList())
        );
        Pedido salvo = service.criar(pedido);
        // Limpa o carrinho
        itemCarrinhoRepository.deleteAll(carrinho.getItens());
        return ResponseEntity.ok(salvo);
    }
}