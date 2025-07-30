// src/main/java/com/pizzaria/service/CarrinhoService.java
package com.pizzaria.service;

import com.pizzaria.dto.AtualizaQuantidadeDTO;
import com.pizzaria.dto.ItemCarrinhoRequestDTO;
import com.pizzaria.dto.ItemCarrinhoResponseDTO;
import com.pizzaria.model.Carrinho;
import com.pizzaria.model.Cliente;
import com.pizzaria.model.ItemCarrinho;
import com.pizzaria.model.Pizza;
import com.pizzaria.repository.CarrinhoRepository;
import com.pizzaria.repository.ClienteRepository;
import com.pizzaria.repository.ItemCarrinhoRepository;
import com.pizzaria.repository.PizzaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CarrinhoService {

    private final PizzaRepository pizzaRepo;
    private final ClienteRepository clienteRepo;
    private final CarrinhoRepository carrinhoRepo;
    private final ItemCarrinhoRepository itemRepo;

    public CarrinhoService(PizzaRepository pizzaRepo,
                           ClienteRepository clienteRepo,
                           CarrinhoRepository carrinhoRepo,
                           ItemCarrinhoRepository itemRepo) {
        this.pizzaRepo = pizzaRepo;
        this.clienteRepo = clienteRepo;
        this.carrinhoRepo = carrinhoRepo;
        this.itemRepo = itemRepo;
    }

    @Transactional
    public void adicionarItem(ItemCarrinhoRequestDTO dto) {
        Pizza pizza = pizzaRepo.findById(dto.getPizzaId())
                .orElseThrow(() -> new RuntimeException("Pizza não encontrada"));
        Cliente cliente = clienteRepo.findById(dto.getClienteId())
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));

        // busca ou cria o carrinho
        Carrinho carrinho = carrinhoRepo
            .findByClienteId(cliente.getId())
            .orElseGet(() -> {
                Carrinho c = new Carrinho();
                c.setCliente(cliente);
                return carrinhoRepo.save(c);
            });

        // se já existe esse item no carrinho, só incrementa a quantidade
        Optional<ItemCarrinho> opt = itemRepo
            .findByCarrinhoIdAndPizzaId(carrinho.getId(), pizza.getId());

        ItemCarrinho item = opt.orElseGet(() -> {
            ItemCarrinho novo = new ItemCarrinho();
            novo.setCarrinho(carrinho);
            novo.setPizza(pizza);
            novo.setCliente(cliente);
            return novo;
        });

        // soma quantidades e recalcula subtotal
        int novaQtd = item.getQuantidade() + dto.getQuantidade();
        item.setQuantidade(novaQtd);
        item.setSubtotal(pizza.getPreco() * novaQtd);

        itemRepo.save(item);
    }

    @Transactional(readOnly = true)
    public List<ItemCarrinhoResponseDTO> listarItensPorCliente(Long clienteId) {
        return carrinhoRepo.findByClienteId(clienteId)
            .map(Carrinho::getItens)
            .orElse(List.of())
            .stream()
            .map(i -> new ItemCarrinhoResponseDTO(
                  i.getId(),
                  i.getPizza().getId(),
                  i.getPizza().getNome(),
                  i.getPizza().getDescricao(),
                  i.getPizza().getPreco(),
                  i.getQuantidade()
            ))
            .collect(Collectors.toList());
    }

    @Transactional
    public void atualizarQuantidade(AtualizaQuantidadeDTO dto) {
        ItemCarrinho item = itemRepo.findById(dto.getItemCarrinhoId())
                .orElseThrow(() -> new RuntimeException("Item do carrinho não encontrado"));
        if (dto.getQuantidade() < 1) {
            itemRepo.delete(item);
            return;
        }
        item.setQuantidade(dto.getQuantidade());
        item.setSubtotal(item.getPizza().getPreco() * dto.getQuantidade());
        itemRepo.save(item);
    }

    @Transactional
    public void removerItem(Long itemId) {
        itemRepo.deleteById(itemId);
    }
}
