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
    public ResponseEntity<?> cadastrarMotorista(@RequestBody Motorista motorista) {
        try {
            // Validação profissional do campo sexo
            if (motorista.getSexo() != null) {
                String sexo = motorista.getSexo().trim().toLowerCase();
                if (!sexo.equals("masculino") && !sexo.equals("feminino") && !sexo.equals("outro")) {
                    return ResponseEntity.badRequest().body("Campo sexo inválido. Use Masculino, Feminino ou Outro.");
                }
            }
            // Validação de CPF
            if (motorista.getCpf() == null || motorista.getCpf().length() != 11) {
                return ResponseEntity.badRequest().body("CPF deve conter 11 dígitos.");
            }
            // Validação de nome
            if (motorista.getNome() == null || motorista.getNome().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Nome é obrigatório.");
            }
            // Validação de data de nascimento
            if (motorista.getDataNascimento() == null) {
                return ResponseEntity.badRequest().body("Data de nascimento é obrigatória.");
            }
            // Validação de e-mail
            if (motorista.getEmail() == null || !motorista.getEmail().contains("@")) {
                return ResponseEntity.badRequest().body("E-mail inválido.");
            }
            // Validação de telefone
            if (motorista.getTelefone() == null || motorista.getTelefone().length() < 10) {
                return ResponseEntity.badRequest().body("Telefone deve conter DDD e número (mínimo 10 dígitos).");
            }
            // Verifica se já existe motorista com o mesmo CPF
            if (motoristaRepository.findByCpf(motorista.getCpf()).isPresent()) {
                return ResponseEntity.badRequest().body("Já existe motorista cadastrado com este CPF.");
            }
            Motorista salvo = motoristaRepository.save(motorista);
            return ResponseEntity.ok(salvo);
        } catch (Exception e) {
            return ResponseEntity.unprocessableEntity().body("Erro ao cadastrar motorista: " + e.getMessage());
        }
    }
}
