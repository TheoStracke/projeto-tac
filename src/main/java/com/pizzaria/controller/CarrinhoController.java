// src/main/java/com/pizzaria/controller/CarrinhoController.java
package com.pizzaria.controller;

import com.pizzaria.dto.AtualizaQuantidadeDTO;
import com.pizzaria.dto.ItemCarrinhoRequestDTO;
import com.pizzaria.dto.ItemCarrinhoResponseDTO;
import com.pizzaria.service.CarrinhoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/carrinho")
@CrossOrigin(origins = "*")
public class CarrinhoController {

    private final CarrinhoService carrinhoService;

    public CarrinhoController(CarrinhoService carrinhoService) {
        this.carrinhoService = carrinhoService;
    }

    /** 1) Adiciona item (ou incrementa quantidade se já existir) */
    @PostMapping
    public ResponseEntity<Void> adicionarItem(@RequestBody ItemCarrinhoRequestDTO dto) {
        carrinhoService.adicionarItem(dto);
        return ResponseEntity.ok().build();
    }

    /** 2) Lista todos os itens do carrinho de um cliente */
    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<ItemCarrinhoResponseDTO>> listarPorCliente(
            @PathVariable Long clienteId) {
        List<ItemCarrinhoResponseDTO> lista = carrinhoService.listarItensPorCliente(clienteId);
        return ResponseEntity.ok(lista);
    }

    /** 3) Atualiza quantidade de um item (se cair abaixo de 1, remove) */
    @PutMapping
    public ResponseEntity<Void> atualizarQuantidade(@RequestBody AtualizaQuantidadeDTO dto) {
        carrinhoService.atualizarQuantidade(dto);
        return ResponseEntity.ok().build();
    }

    /** 4) Remove um item específico */
    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> removerItem(@PathVariable Long itemId) {
        carrinhoService.removerItem(itemId);
        return ResponseEntity.noContent().build();
    }
}
