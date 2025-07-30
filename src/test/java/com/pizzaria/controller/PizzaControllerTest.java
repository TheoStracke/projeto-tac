package com.pizzaria.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pizzaria.model.Pizza;
import com.pizzaria.service.PizzaService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import java.util.Arrays;
import java.util.Optional;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PizzaController.class)
@org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc(addFilters = false)
class PizzaControllerTest {
    @Autowired
    private MockMvc mockMvc;
    @org.springframework.boot.test.mock.mockito.MockBean
    private PizzaService pizzaService;
    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testListar() throws Exception {
        Pizza pizza = new Pizza();
        when(pizzaService.listar()).thenReturn(Arrays.asList(pizza));
        mockMvc.perform(get("/pizzas"))
                .andExpect(status().isOk());
    }

    @Test
    void testDetalhar() throws Exception {
        Pizza pizza = new Pizza();
        pizza.setId(1L);
        when(pizzaService.buscar(1L)).thenReturn(Optional.of(pizza));
        mockMvc.perform(get("/pizzas/1"))
                .andExpect(status().isOk());
    }

    @Test
    void testCriar() throws Exception {
        Pizza pizza = new Pizza();
        when(pizzaService.salvar(any(Pizza.class))).thenReturn(pizza);
        mockMvc.perform(post("/pizzas")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(pizza)))
                .andExpect(status().isOk());
    }
}
