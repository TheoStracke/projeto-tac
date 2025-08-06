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
public class AuthController {

    @Autowired
    private EmpresaService empresaService;
    
    @Autowired
    private JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@RequestBody LoginRequest request) {
        try {
            if (request == null) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Request inválido"));
            }
            
            if (request.getCnpj() == null || request.getSenha() == null) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("CNPJ e senha são obrigatórios"));
            }
            
            // Remover formatação do CNPJ (pontos, barras, hífens)
            String cnpjLimpo = request.getCnpj().replaceAll("[^0-9]", "");
            
            Optional<Empresa> empresaOpt = empresaService.autenticar(cnpjLimpo, request.getSenha());

            if (empresaOpt.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("CNPJ ou senha inválidos"));
            }

            Empresa empresa = empresaOpt.get();
            String token = jwtService.generateToken(empresa);
            
            LoginResponse loginResponse = new LoginResponse(
                token,
                empresa.getId(),
                empresa.getCnpj(),
                empresa.getRazaoSocial(),
                empresa.getEmail(),
                empresa.getTipo()
            );

            return ResponseEntity.ok(ApiResponse.success("Login realizado com sucesso", loginResponse));
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("Erro interno: " + e.getMessage()));
        }
    }

    @PostMapping("/cadastro")
    public ResponseEntity<ApiResponse<String>> cadastro(@RequestBody Empresa empresa) {
        try {
            System.out.println("🔹 Recebendo requisição de cadastro...");
            System.out.println("📋 CNPJ recebido: " + empresa.getCnpj());
            System.out.println("🏢 Razão Social: " + empresa.getRazaoSocial());
            
            // Remover formatação do CNPJ (pontos, barras, hífens)
            String cnpjLimpo = empresa.getCnpj().replaceAll("[^0-9]", "");
            empresa.setCnpj(cnpjLimpo);
            
            // Verificar se CNPJ já existe
            if (empresaService.buscarPorCnpj(cnpjLimpo).isPresent()) {
                System.out.println("❌ CNPJ já cadastrado: " + cnpjLimpo);
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("CNPJ já cadastrado"));
            }
            
            empresaService.salvar(empresa);
            System.out.println("✅ Empresa cadastrada com sucesso!");
            
            return ResponseEntity.ok(ApiResponse.success("Empresa cadastrada com sucesso!", null));
            
        } catch (Exception e) {
            System.out.println("❌ Erro ao cadastrar: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("Erro ao cadastrar: " + e.getMessage()));
        }
    }
}
