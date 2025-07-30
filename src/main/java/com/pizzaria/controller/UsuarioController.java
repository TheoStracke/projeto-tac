package com.pizzaria.controller;

import com.pizzaria.model.Usuario;
import com.pizzaria.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {
    @Autowired
    private UsuarioService service;

    @PostMapping
    public Usuario cadastrar(@RequestBody Usuario usuario) {
        return service.salvar(usuario);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Usuario credenciais) {
        return service.autenticar(credenciais.getEmail(), credenciais.getSenha())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(401).build());
    }
}
