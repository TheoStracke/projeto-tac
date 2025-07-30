package com.validacao.service;

import com.validacao.model.Empresa;
import com.validacao.model.TipoEmpresa;
import com.validacao.repository.EmpresaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.List;

@Service
public class EmpresaService {
    @Autowired
    private EmpresaRepository empresaRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    public Empresa salvar(Empresa empresa) {
        // Criptografar senha antes de salvar
        if (empresa.getSenha() != null && !empresa.getSenha().startsWith("$2a$")) {
            empresa.setSenha(passwordEncoder.encode(empresa.getSenha()));
        }
        return empresaRepository.save(empresa);
    }
    
    public Optional<Empresa> autenticar(String cnpj, String senha) {
        System.out.println("=== DEBUG AUTENTICACAO ===");
        System.out.println("Buscando empresa com CNPJ: " + cnpj);
        
        Optional<Empresa> empresaOpt = empresaRepository.findByCnpj(cnpj);
        
        if (empresaOpt.isPresent()) {
            Empresa empresa = empresaOpt.get();
            System.out.println("Empresa encontrada: " + empresa.getRazaoSocial());
            System.out.println("Senha no banco: " + (empresa.getSenha() != null ? "[EXISTE]" : "[NULL]"));
            System.out.println("Senha informada: " + (senha != null ? "[EXISTE]" : "[NULL]"));
            
            // Verificar se a senha bate (considerando senhas já hasheadas e não hasheadas para desenvolvimento)
            boolean senhaCorreta = false;
            
            if (empresa.getSenha().startsWith("$2a$")) {
                System.out.println("Testando senha hasheada com BCrypt...");
                senhaCorreta = passwordEncoder.matches(senha, empresa.getSenha());
                System.out.println("Resultado BCrypt: " + senhaCorreta);
            } else {
                System.out.println("Testando senha em texto plano...");
                senhaCorreta = senha != null && senha.equals(empresa.getSenha());
                System.out.println("Resultado texto plano: " + senhaCorreta);
                
                // Se a senha está correta, aproveitar para hashear
                if (senhaCorreta) {
                    System.out.println("Hasheando senha para próximas vezes...");
                    empresa.setSenha(passwordEncoder.encode(senha));
                    empresaRepository.save(empresa);
                }
            }
            
            if (senhaCorreta) {
                System.out.println("AUTENTICACAO SUCESSO!");
                return Optional.of(empresa);
            } else {
                System.out.println("AUTENTICACAO FALHOU - senha incorreta");
            }
        } else {
            System.out.println("AUTENTICACAO FALHOU - empresa não encontrada");
        }
        
        return Optional.empty();
    }
    
    public Optional<Empresa> buscarPorCnpj(String cnpj) {
        return empresaRepository.findByCnpj(cnpj);
    }
    
    public List<Empresa> buscarPorTipo(TipoEmpresa tipo) {
        return empresaRepository.findByTipo(tipo);
    }
    
    public boolean isEstradaFacil(String cnpj) {
        // CNPJs específicos que são ESTRADA_FACIL (ADMIN)
        return "43.403.910/0001-28".equals(cnpj) || "20.692.051/0001-39".equals(cnpj);
    }
    
    public boolean isAdmin(String cnpj) {
        return isEstradaFacil(cnpj);
    }
}
