package com.validacao.controller;

import com.validacao.dto.ApiResponse;
import com.validacao.dto.LoginRequest;
import com.validacao.dto.LoginResponse;
import com.validacao.model.Empresa;
import com.validacao.service.EmpresaService;
import com.validacao.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private EmpresaService empresaService;
    
    @Autowired
    private JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@RequestBody LoginRequest request) {
        System.out.println("=== DEBUG LOGIN ===");
        System.out.println("Request recebido: " + request);
        System.out.println("CNPJ: " + (request != null ? request.getCnpj() : "null"));
        System.out.println("Senha: " + (request != null ? request.getSenha() : "null"));
        
        try {
            if (request == null) {
                System.out.println("ERRO: Request é null");
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Request inválido"));
            }
            
            if (request.getCnpj() == null || request.getSenha() == null) {
                System.out.println("ERRO: CNPJ ou senha são null");
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("CNPJ e senha são obrigatórios"));
            }
            
            Optional<Empresa> empresaOpt = empresaService.autenticar(request.getCnpj(), request.getSenha());
            System.out.println("Resultado da autenticação: " + (empresaOpt.isPresent() ? "SUCESSO" : "FALHOU"));

            if (empresaOpt.isEmpty()) {
                System.out.println("ERRO: Empresa não encontrada ou senha incorreta");
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("CNPJ ou senha inválidos"));
            }

            Empresa empresa = empresaOpt.get();
            System.out.println("Empresa encontrada: " + empresa.getRazaoSocial());
            
            String token = jwtService.generateToken(empresa);
            System.out.println("Token gerado: " + (token != null ? "OK" : "FALHOU"));
            
            LoginResponse loginResponse = new LoginResponse(
                token,
                empresa.getId(),
                empresa.getCnpj(),
                empresa.getRazaoSocial(),
                empresa.getEmail(),
                empresa.getTipo()
            );
            System.out.println("LoginResponse criado: OK");

            return ResponseEntity.ok(ApiResponse.success("Login realizado com sucesso", loginResponse));
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("Erro interno: " + e.getMessage()));
        }
    }

    @PostMapping("/cadastro")
    public ResponseEntity<ApiResponse<String>> cadastro(@RequestBody Empresa empresa) {
        try {
            // Verificar se CNPJ já existe
            if (empresaService.buscarPorCnpj(empresa.getCnpj()).isPresent()) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("CNPJ já cadastrado"));
            }
            
            empresaService.salvar(empresa);
            return ResponseEntity.ok(ApiResponse.success("Empresa cadastrada com sucesso!", null));
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("Erro ao cadastrar: " + e.getMessage()));
        }
    }
}
