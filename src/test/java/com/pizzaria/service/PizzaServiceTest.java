package com.pizzaria.service;

import com.pizzaria.model.Pizza;
import com.pizzaria.repository.PizzaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PizzaServiceTest {
    @Mock
    private PizzaRepository pizzaRepository;

    @InjectMocks
    private PizzaService pizzaService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testListar() {
        Pizza pizza = new Pizza();
        when(pizzaRepository.findAll()).thenReturn(Arrays.asList(pizza));
        List<Pizza> result = pizzaService.listar();
        assertEquals(1, result.size());
    }

    @Test
    void testBuscar() {
        Pizza pizza = new Pizza();
        pizza.setId(1L);
        when(pizzaRepository.findById(1L)).thenReturn(Optional.of(pizza));
        Optional<Pizza> result = pizzaService.buscar(1L);
        assertTrue(result.isPresent());
        assertEquals(1L, result.get().getId());
    }

    @Test
    void testSalvar() {
        Pizza pizza = new Pizza();
        when(pizzaRepository.save(pizza)).thenReturn(pizza);
        Pizza result = pizzaService.salvar(pizza);
        assertNotNull(result);
    }

    @Test
    void testDeletar() {
        pizzaService.deletar(1L);
        verify(pizzaRepository, times(1)).deleteById(1L);
    }
}
