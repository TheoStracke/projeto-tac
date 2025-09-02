package com.validacao.controller;

import com.validacao.model.Motorista;
import com.validacao.repository.MotoristaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/motoristas")
public class MotoristaController {
    @Autowired
    private MotoristaRepository motoristaRepository;

    // Busca motoristas por nome ou CPF (parcial)
    @GetMapping("/buscar")
    public ResponseEntity<List<Motorista>> buscarMotoristas(@RequestParam("termo") String termo) {
        List<Motorista> motoristas = motoristaRepository.findByCpfOrNomeContaining(termo);
        return ResponseEntity.ok(motoristas);
    }

    // Cadastro de motorista
    @PostMapping("/cadastrar")
    public ResponseEntity<Motorista> cadastrarMotorista(@RequestBody Motorista motorista) {
            // Validação profissional do campo sexo
            if (motorista.getSexo() != null) {
                String sexo = motorista.getSexo().trim().toLowerCase();
                if (!sexo.equals("masculino") && !sexo.equals("feminino") && !sexo.equals("outro")) {
                    return ResponseEntity.badRequest().body(null);
                }
            }
        Motorista salvo = motoristaRepository.save(motorista);
        return ResponseEntity.ok(salvo);
    }
}
