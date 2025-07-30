package com.pizzaria.service;

import com.pizzaria.model.Usuario;
import com.pizzaria.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UsuarioService {
    @Autowired
    private UsuarioRepository repo;

    public Usuario salvar(Usuario usuario) { return repo.save(usuario); }
    public Optional<Usuario> autenticar(String email, String senha) {
        return repo.findByEmailAndSenha(email, senha);
    }
}
