package com.pizzaria.repository;

import com.pizzaria.model.ItemCarrinho;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ItemCarrinhoRepository extends JpaRepository<ItemCarrinho, Long> {
    Optional<ItemCarrinho> findByCarrinhoIdAndPizzaId(Long carrinhoId, Long pizzaId);
}
